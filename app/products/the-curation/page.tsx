import type { Metadata } from "next";
import CurationDetail from "@/components/CurationDetail";
import { curation } from "@/lib/products";

export const metadata: Metadata = {
  title: `${curation.name} — Nutravey`,
  description: curation.description,
};

export default function TheCurationPage() {
  return <CurationDetail />;
}
