import type { Metadata } from "next";
import Link from "next/link";
import { verifyPass } from "@/lib/pass";
import PassView from "@/components/PassView";
import SystemPage from "@/components/SystemPage";

export const metadata: Metadata = {
  title: "Ritual Pass — Nutravey",
  // Capability URLs must never end up in a search index.
  robots: { index: false, follow: false },
};

export default async function PassPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const pass = t ? verifyPass(t) : null;

  if (!pass) {
    return (
      <SystemPage
        eyebrow="Ritual Pass"
        heading="This pass isn't valid."
        copy="The link may be incomplete — check that you opened the full URL from your confirmation. Passes are issued when you reserve a launch slot."
      >
        <Link href="/shop" className="system-home-link mono-cta">
          Reserve a slot →
        </Link>
      </SystemPage>
    );
  }

  return <PassView pass={pass} />;
}
