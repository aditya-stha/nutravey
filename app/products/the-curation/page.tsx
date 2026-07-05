import type { Metadata } from "next";
import CurationDetail from "@/components/CurationDetail";
import { curation } from "@/lib/products";
import { getShopifyProduct } from "@/lib/shopify";

export const metadata: Metadata = {
  title: `${curation.name} — Nutravey`,
  description: curation.description,
};

export default async function TheCurationPage() {
  // The bundle is a normal Shopify product whose handle matches the slug.
  const shopify = await getShopifyProduct(curation.slug);
  return (
    <CurationDetail
      variantId={shopify?.variantId}
      available={shopify?.available ?? false}
    />
  );
}
