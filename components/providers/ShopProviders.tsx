"use client";

/* ─── Shopify client providers ─────────────────────────────────────────────
   `ShopifyProvider` supplies store config to Hydrogen React hooks; `CartProvider`
   manages the Storefront cart (create / add / update / remove) and persists the
   cart id in localStorage. Both are Client Components — React context is not
   available in Server Components — so this file carries the "use client"
   boundary and is mounted from the root layout around {children}. */

import { ShopifyProvider, CartProvider } from "@shopify/hydrogen-react";
import {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_TOKEN,
  SHOPIFY_STOREFRONT_API_VERSION,
  SHOPIFY_COUNTRY,
  SHOPIFY_LANGUAGE,
} from "@/lib/shopify-config";

export default function ShopProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ShopifyProvider throws if storeDomain / storefrontToken are empty, and it
    // must stay mounted so `useCart` always has a provider. When env is absent
    // (e.g. a credential-less build) we pass inert placeholders; no Storefront
    // call is made because `isShopifyConfigured` gates all purchasing UI.
    <ShopifyProvider
      storeDomain={SHOPIFY_STORE_DOMAIN || "unconfigured.myshopify.com"}
      storefrontToken={SHOPIFY_STOREFRONT_TOKEN || "unconfigured"}
      storefrontApiVersion={SHOPIFY_STOREFRONT_API_VERSION}
      countryIsoCode={SHOPIFY_COUNTRY}
      languageIsoCode={SHOPIFY_LANGUAGE}
    >
      <CartProvider>{children}</CartProvider>
    </ShopifyProvider>
  );
}
