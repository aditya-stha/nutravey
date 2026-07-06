import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { products, getProduct, type ProductSlug } from "@/lib/products";
import { getShopifyProduct } from "@/lib/shopify";
import { getReviews } from "@/lib/reviews";

/* All flavour PDPs share this route; `lib/products.ts` is the roster.
   `dynamicParams = false` 404s any slug not returned below, so `getProduct`
   can never see an unknown slug. `/products/the-curation` remains its own
   static route and takes precedence over this segment. */
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: ProductSlug }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return {
    title: `${product.name} — Nutravey`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  // Local slug maps 1:1 to the Shopify product handle.
  const [shopify, reviews] = await Promise.all([
    getShopifyProduct(product.slug),
    getReviews(product.slug),
  ]);
  return (
    <ProductDetail
      product={product}
      variantId={shopify?.variantId}
      available={shopify?.available ?? false}
      subscriptionPlans={shopify?.subscriptionPlans ?? []}
      reviews={reviews}
    />
  );
}
