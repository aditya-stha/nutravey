import type { Metadata } from "next";
import { Suspense } from "react";
import ShopCollection from "@/components/ShopCollection";
import PreLaunchShop from "@/components/PreLaunchShop";
import { isPreLaunch } from "@/lib/shopify-config";

export const metadata: Metadata = {
  title: "The Collection — Nutravey",
  description:
    "Three flavours, three rituals. Browse the full Nutravey collection of hydration and multivitamin sachets.",
};

export default function ShopPage() {
  if (isPreLaunch) {
    // Suspense: PreLaunchShop reads ?item= via useSearchParams, which
    // requires a boundary to keep the rest of the page statically rendered.
    return (
      <Suspense>
        <PreLaunchShop />
      </Suspense>
    );
  }
  return <ShopCollection />;
}

