import type { Metadata } from "next";
import Link from "next/link";
import SetPasswordForm from "@/components/account/SetPasswordForm";
import SystemPage from "@/components/SystemPage";
import { isOurAccountUrl } from "@/lib/customer-account";

export const metadata: Metadata = {
  title: "Reset your password — Nutravey",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* ─── Password reset ────────────────────────────────────────────────────────
   Landing for the recovery email's reset link. The ?t= param carries
   Shopify's reset URL (id + one-time token); the customer only ever sees
   our page — the URL is redeemed server-side via customerResetByUrl. */

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  if (!t || !isOurAccountUrl(t, "reset")) {
    return (
      <SystemPage
        eyebrow="Account"
        heading="This reset link isn't valid."
        copy="Open the link from your reset email in full — or request a fresh one from Forgot password on the account page."
      >
        <Link href="/account" className="system-home-link mono-cta">
          To the account page →
        </Link>
      </SystemPage>
    );
  }

  return (
    <div className="content-rail section-padding">
      <p
        className="mono-label"
        style={{ color: "var(--color-ink)", opacity: 0.5, marginBottom: "12px" }}
      >
        Account
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(40px, 6vw, 72px)",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: "var(--color-ink)",
          marginBottom: "24px",
        }}
      >
        Choose a new password.
      </h1>
      <p
        className="mono-body"
        style={{
          fontSize: "15px",
          lineHeight: 1.7,
          color: "var(--color-ink-muted)",
          maxWidth: "460px",
          marginBottom: "32px",
        }}
      >
        This link works once. Set your new password below and you&rsquo;re
        signed straight back in.
      </p>
      <SetPasswordForm mode="reset" url={t} />
    </div>
  );
}
