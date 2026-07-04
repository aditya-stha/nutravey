import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";
import { getShopifyProduct } from "@/lib/shopify";

const product = getProduct("strawberry-surge");

export const metadata: Metadata = {
  title: `${product.name} — Nutravey`,
  description: product.description,
};

export default async function StrawberrySurgePage() {
  // Local slug maps 1:1 to the Shopify product handle.
  const shopify = await getShopifyProduct(product.slug);
  return (
    <ProductDetail
      product={product}
      variantId={shopify?.variantId}
      available={shopify?.available ?? false}
    />
  );
}
