import "server-only";

/* ─── Server-side Storefront API client ────────────────────────────────────
   Runs only in Server Components / Route Handlers. Prefers the private
   (delegate) token when present for higher rate limits; otherwise falls back
   to the public token. Used to load live commerce data (variant id, price,
   availability) that is then merged with the editorial product data in
   `lib/products.ts`. The cart itself is handled client-side by CartProvider. */

import { createStorefrontClient } from "@shopify/hydrogen-react";
import {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_TOKEN,
  SHOPIFY_STOREFRONT_API_VERSION,
  isShopifyConfigured,
} from "@/lib/shopify-config";

const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || undefined;

/* Created lazily and memoized: `createStorefrontClient` throws in production
   if `storeDomain` is empty, so we only instantiate it once we know the
   storefront is configured (callers guard on `isShopifyConfigured` first). */
type StorefrontClient = ReturnType<typeof createStorefrontClient>;
let _client: StorefrontClient | undefined;

function getClient(): StorefrontClient {
  if (!_client) {
    _client = createStorefrontClient({
      storeDomain: SHOPIFY_STORE_DOMAIN,
      storefrontApiVersion: SHOPIFY_STOREFRONT_API_VERSION,
      privateStorefrontToken: privateToken,
      publicStorefrontToken: SHOPIFY_STOREFRONT_TOKEN,
    });
  }
  return _client;
}

/** Money as returned by the Storefront API. */
export interface Money {
  amount: string;
  currencyCode: string;
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
}

/**
 * Low-level Storefront API GraphQL fetch. Throws on network / GraphQL errors.
 * Uses the private token headers when available, public otherwise.
 */
export async function storefrontQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const client = getClient();
  const headers = privateToken
    ? client.getPrivateTokenHeaders()
    : client.getPublicTokenHeaders();

  const res = await fetch(client.getStorefrontApiUrl(), {
    method: "POST",
    headers,
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
  if (!isShopifyConfigured) return null;

  try {
    const { product } = await storefrontQuery<ProductByHandleResponse>(
      PRODUCT_BY_HANDLE,
      { handle },
    );
    const variant = product?.variants.nodes[0];
    if (!product || !variant) return null;

    return {
      id: product.id,
      handle: product.handle,
      available: product.availableForSale && variant.availableForSale,
      variantId: variant.id,
      price: variant.price,
    };
  } catch (err) {
    // Don't take the whole PDP down if Storefront is briefly unreachable —
    // fall back to static pricing and a disabled cart button.
    console.error(`getShopifyProduct("${handle}") failed:`, err);
    return null;
  }
}
