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
): Promise<T> {
  const url = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: storefrontHeaders(),
    body: JSON.stringify({ query, variables }),
    // Revalidate live commerce data hourly; tune per your needs.
    next: { revalidate: 3600 },
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

const PRODUCT_BY_HANDLE = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      availableForSale
      variants(first: 1) {
        nodes {
          id
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
`;

interface ProductByHandleResponse {
  product: {
    id: string;
    handle: string;
    availableForSale: boolean;
    variants: {
      nodes: Array<{
        id: string;
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
  } | null;
}

/**
 * Loads live commerce data for a product by its Shopify handle (which we map
 * 1:1 to the local product `slug`). Returns `null` when Shopify isn't
 * configured or the product / variant doesn't exist — callers fall back to
 * the static price from `lib/products.ts` and disable add-to-cart.
 */
export async function getShopifyProduct(
  handle: string,
): Promise<ShopifyProductData | null> {
  // Product data works tokenless — only the domain is required.
  if (!SHOPIFY_STORE_DOMAIN) return null;

  try {
    const { product } = await storefrontQuery<ProductByHandleResponse>(
      PRODUCT_BY_HANDLE,
      { handle },
    );
    const variant = product?.variants.nodes[0];
    if (!product || !variant) return null;

    const subscriptionPlans: SubscriptionPlan[] =
      product.sellingPlanGroups.nodes.flatMap((group) =>
        group.sellingPlans.nodes.map((plan) => ({
          id: plan.id,
          name: plan.name,
          percentOff: plan.priceAdjustments[0]?.adjustmentValue
            ?.adjustmentPercentage,
        })),
      );

    return {
      id: product.id,
      handle: product.handle,
      available: product.availableForSale && variant.availableForSale,
      variantId: variant.id,
      price: variant.price,
      subscriptionPlans,
    };
  } catch (err) {
    // Don't take the whole PDP down if Storefront is briefly unreachable —
    // fall back to static pricing and a disabled cart button.
    console.error(`getShopifyProduct("${handle}") failed:`, err);
    return null;
  }
}
