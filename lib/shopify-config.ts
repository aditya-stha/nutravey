/* ─── Shopify public config ────────────────────────────────────────────────
   Values prefixed with NEXT_PUBLIC_ are inlined at build time and are safe
   to read on both server and client. The public Storefront token is meant
   to be exposed to the browser — the cart runs client-side. */

export const SHOPIFY_STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";

export const SHOPIFY_STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";

/** The store's customer-facing primary domain. Shopify mints account
 *  activation and password-reset URLs on this host, not the .myshopify
 *  one — URL validation must accept both. */
export const SHOPIFY_PRIMARY_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_PRIMARY_DOMAIN ?? "shop.nutravey.com";

export const SHOPIFY_STOREFRONT_API_VERSION =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION ?? "2026-04";

/** i18n defaults for ShopifyProvider / CartProvider. */
export const SHOPIFY_COUNTRY = "US" as const;
export const SHOPIFY_LANGUAGE = "EN" as const;

/** True only when the storefront is configured — lets the UI degrade
 *  gracefully (disabled buttons, local price fallback) when env is absent,
 *  e.g. on a fresh clone or in CI without secrets. */
export const isShopifyConfigured = Boolean(
  SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_TOKEN,
);

/** If true, the storefront runs in an interactive pre-launch 'Coming Soon' state,
 *  disabling active checkout and showing the Reservation System & Brand Exhibition. */
export const isPreLaunch =
  process.env.NEXT_PUBLIC_PRE_LAUNCH !== "false"; // Default to true for development/preview unless set to 'false'

