import "server-only";

/* ─── Server-side Storefront API client ────────────────────────────────────
   Runs only in Server Components / Route Handlers. Loads live commerce data
   (variant id, price, availability, selling plans) that is merged with the
   editorial product data in `lib/products.ts`. The cart itself is handled
   client-side by CartProvider.

   Auth tiers, best-available first:
   1. Private (delegate) token — server rate limits.
   2. Public storefront token.
   3. Tokenless — products/selling plans need no token at all (complexity
      limit 1,000; our queries are far below). Requires only the domain, so
      live product data flows before any credentials exist. The cart still
      needs the public token (CartProvider authenticates with it). */

import {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_TOKEN,
  SHOPIFY_STOREFRONT_API_VERSION,
} from "@/lib/shopify-config";

const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || undefined;

function storefrontHeaders(): Record<string, string> {
  if (privateToken) {
    return {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": privateToken,
    };
  }
  if (SHOPIFY_STOREFRONT_TOKEN) {
    return {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    };
  }
  return { "Content-Type": "application/json" }; // tokenless
}

/** Money as returned by the Storefront API. */
export interface Money {
  amount: string;
  currencyCode: string;
}

/** A subscription option (Shopify selling plan), normalized for the PDP. */
export interface SubscriptionPlan {
  /** Selling plan GID — passed as `sellingPlanId` on the cart line. */
  id: string;
  /** Merchant-defined label, e.g. "Every 4 weeks". */
  name: string;
  /** Percentage discount vs one-time price, when the plan defines one. */
  percentOff?: number;
}

/** Normalized commerce data for a single product, merged into the PDP. */
export interface ShopifyProductData {
  /** Storefront product GID. */
  id: string;
  handle: string;
  available: boolean;
  /** GID of the first variant — the `merchandiseId` for `linesAdd`. */
  variantId: string;
  price: Money;
  /** Subscribe & Save options; empty when the product has no selling plans. */
  subscriptionPlans: SubscriptionPlan[];
}

/**
 * Low-level Storefront API GraphQL fetch. Throws on network / GraphQL errors.
 * Uses the best available auth tier (private → public → tokenless).
 */
export async function storefrontQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: { noStore?: boolean } = {},
): Promise<T> {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: storefrontHeaders(),
    body: JSON.stringify({ query, variables }),
    // Customer-scoped data is never cached; catalog data revalidates hourly.
    ...(opts.noStore
      ? { cache: "no-store" as const }
      : { next: { revalidate: 3600 } }),
  });

  if (!res.ok) {
    throw new Error(`Storefront API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`Storefront API errors: ${JSON.stringify(json.errors)}`);
  }
  if (!json.data) throw new Error("Storefront API returned no data");
  return json.data;
}

const CATALOG_QUERY = /* GraphQL */ `
  query Catalog {
    products(first: 20) {
      nodes {
        id
        handle
        title
        availableForSale
        variants(first: 20) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
        sellingPlanGroups(first: 3) {
          nodes {
            sellingPlans(first: 6) {
              nodes {
                id
                name
                priceAdjustments {
                  adjustmentValue {
                    ... on SellingPlanPercentagePriceAdjustment {
                      adjustmentPercentage
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface CatalogResponse {
  products: {
    nodes: Array<{
      id: string;
      handle: string;
      title: string;
      availableForSale: boolean;
      variants: {
        nodes: Array<{
          id: string;
          title: string;
          availableForSale: boolean;
          price: Money;
        }>;
      };
      sellingPlanGroups: {
        nodes: Array<{
          sellingPlans: {
            nodes: Array<{
              id: string;
              name: string;
              priceAdjustments: Array<{
                adjustmentValue: { adjustmentPercentage?: number };
              }>;
            }>;
          };
        }>;
      };
    }>;
  };
}

type CatalogProduct = CatalogResponse["products"]["nodes"][number];

const norm = (s: string) => s.trim().toLowerCase();

/* Slug → the human name to match against Shopify variant/product titles.
   The store models the flavour line as ONE product ("Electrolytes Powder
   Mix") with a variant per flavour, so we match by *title*, not by handle —
   titles are what the merchant deliberately controls in admin. */
const SLUG_TO_NAME: Record<string, string> = {
  "strawberry-surge": "Strawberry Surge",
  "lychee-lush": "Lychee Lush",
  "lemon-zest": "Lemon Zest",
  "the-curation": "The Curation",
};

function normalizePlans(product: CatalogProduct): SubscriptionPlan[] {
  return product.sellingPlanGroups.nodes.flatMap((group) =>
    group.sellingPlans.nodes.map((plan) => ({
      id: plan.id,
      name: plan.name,
      percentOff: plan.priceAdjustments[0]?.adjustmentValue
        ?.adjustmentPercentage,
    })),
  );
}

/**
 * Loads live commerce data for a local product slug. Matching order:
 * 1. a variant whose title equals the flavour name (variant-based catalog);
 * 2. a product whose handle equals the slug or title equals the name
 *    (separate-products catalog, e.g. The Curation).
 * Returns `null` when Shopify is unreachable/unconfigured or nothing
 * matches — callers fall back to static pricing and disable add-to-cart.
 */
export async function getShopifyProduct(
  slug: string,
): Promise<ShopifyProductData | null> {
  // Product data works tokenless — only the domain is required.
  if (!SHOPIFY_STORE_DOMAIN) return null;

  const name = norm(SLUG_TO_NAME[slug] ?? slug);

  try {
    const { products } = await storefrontQuery<CatalogResponse>(CATALOG_QUERY);

    // 1. Variant title match anywhere in the catalog.
    for (const product of products.nodes) {
      const variant = product.variants.nodes.find(
        (v) => norm(v.title) === name,
      );
      if (variant) {
        return {
          id: product.id,
          handle: slug,
          available: product.availableForSale && variant.availableForSale,
          variantId: variant.id,
          price: variant.price,
          subscriptionPlans: normalizePlans(product),
        };
      }
    }

    // 2. Whole-product match by handle or title.
    const product = products.nodes.find(
      (p) => p.handle === slug || norm(p.title) === name,
    );
    const variant = product?.variants.nodes[0];
    if (!product || !variant) return null;

    return {
      id: product.id,
      handle: slug,
      available: product.availableForSale && variant.availableForSale,
      variantId: variant.id,
      price: variant.price,
      subscriptionPlans: normalizePlans(product),
    };
  } catch (err) {
    // Don't take the whole PDP down if Storefront is briefly unreachable —
    // fall back to static pricing and a disabled cart button.
    console.error(`getShopifyProduct("${slug}") failed:`, err);
    return null;
  }
}
