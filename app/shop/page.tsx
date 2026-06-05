import type { Metadata } from "next";
import ShopCollection from "@/components/ShopCollection";

export const metadata: Metadata = {
  title: "The Collection — Nutravey",
  description:
    "Three flavours, three rituals. Browse the full Nutravey collection of hydration and multivitamin sachets.",
};

export default function ShopPage() {
  return <ShopCollection />;
}
