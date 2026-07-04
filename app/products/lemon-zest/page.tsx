import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";
import { getShopifyProduct } from "@/lib/shopify";

const product = getProduct("lemon-zest");

export const metadata: Metadata = {
  title: `${product.name} — Nutravey`,
  description: product.description,
};

export default async function LemonZestPage() {
  const shopify = await getShopifyProduct(product.slug);
  return (
    <ProductDetail
      product={product}
      variantId={shopify?.variantId}
      available={shopify?.available ?? false}
    />
  );
}
