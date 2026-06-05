import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";

const product = getProduct("lychee-lush");

export const metadata: Metadata = {
  title: `${product.name} — Nutravey`,
  description: product.description,
};

export default function LycheeLushPage() {
  return <ProductDetail product={product} />;
}
