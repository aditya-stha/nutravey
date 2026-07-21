import type { Metadata } from "next";
import Link from "next/link";
import SetPasswordForm from "@/components/account/SetPasswordForm";
import SystemPage from "@/components/SystemPage";
import { isOurAccountUrl } from "@/lib/customer-account";

export const metadata: Metadata = {
  title: "Activate your account — Nutravey",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/* ─── Account activation ────────────────────────────────────────────────────
   Landing for the activation email sent when a back-office customer record
   (waitlist, checkout, admin-created) tries to sign in or register. The ?t=
   param carries Shopify's activation URL; the customer only ever sees our
   page — the URL is redeemed server-side. */

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  if (!t || !isOurAccountUrl(t, "activate")) {
    return (
      <SystemPage
        eyebrow="Account"
        heading="This activation link isn't valid."
        copy="Open the link from your activation email in full — or head to the account page and use Forgot password."
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
        One password and you&rsquo;re in.
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
        Your email is already on our books — it just never had a password.
        Set one below and your account opens with everything attached to it.
      </p>
      <SetPasswordForm mode="activate" url={t} />
    </div>
  );
}
