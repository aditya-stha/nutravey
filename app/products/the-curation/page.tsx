import type { Metadata } from "next";
import CurationDetail from "@/components/CurationDetail";
import { curation, products } from "@/lib/products";
import { getShopifyProduct } from "@/lib/shopify";

export const metadata: Metadata = {
  title: `${curation.name} — Nutravey`,
  description: curation.description,
};

export default async function TheCurationPage() {
  /* The bundle is a composite, not a Shopify product: adding it puts one of
     each flavour variant in the cart. The $108 bundle price is applied by an
     automatic discount configured in Shopify admin. (One cached catalog
     query serves all three lookups.) */
  const flavours = await Promise.all(
    products.map((p) => getShopifyProduct(p.slug)),
  );
  const allLive = flavours.every((f) => f?.available);
  const variantIds = allLive
    ? flavours.map((f) => f!.variantId)
    : [];

  return <CurationDetail variantIds={variantIds} available={allLive} />;
}
