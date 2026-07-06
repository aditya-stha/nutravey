import type { Metadata } from "next";
import Link from "next/link";
import { verifyOrder } from "@/lib/order-token";
import SystemPage from "@/components/SystemPage";

export const metadata: Metadata = {
  title: "Order confirmed — Nutravey",
  robots: { index: false, follow: false },
};

/* ─── Owned post-purchase page ──────────────────────────────────────────────
   Reached from the confirmation email's signed link. Shopify's checkout
   finishes the transaction; this page carries the brand past it — summary,
   live tracking link, and the paths back into the ritual. */

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const order = t ? verifyOrder(t) : null;

  if (!order) {
    return (
      <SystemPage
        eyebrow="Order"
        heading="This order link isn't valid."
        copy="Open the link from your confirmation email in full — if it still doesn't resolve, reply to that email and we'll sort it."
      >
        <Link href="/shop" className="system-home-link mono-cta">
          Back to the collection →
        </Link>
      </SystemPage>
    );
  }

  return (
    <div
      className="content-rail section-padding"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <p className="mono-label" style={{ opacity: 0.5, marginBottom: "18px" }}>
        Order {order.num} · Confirmed
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(40px, 6vw, 72px)",
          letterSpacing: "-0.03em",
          lineHeight: 0.98,
          color: "var(--color-ink)",
          marginBottom: "20px",
          maxWidth: "680px",
        }}
      >
        The ritual is on its way, {order.name}.
      </h1>
      <p
        className="mono-body"
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "var(--color-ink-muted)",
          maxWidth: "420px",
          marginBottom: "48px",
        }}
      >
        Confirmed and in preparation. Tracking goes live below the moment it
        ships — and your receipt is with {order.email}.
      </p>

      {/* Summary panel — supplement-facts language */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          border: "0.4px solid var(--color-rule)",
          borderRadius: "var(--radius-canvas)",
          background: "var(--color-surface-card)",
          padding: "28px",
          textAlign: "left",
        }}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {order.items.map((item) => (
            <li
              key={item}
              className="mono-body"
              style={{
                padding: "12px 0",
                borderBottom: "0.4px solid var(--color-rule)",
                fontSize: "14px",
                color: "var(--color-ink)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: "16px",
          }}
        >
          <span className="mono-label" style={{ color: "var(--color-ink-muted)" }}>
            Total
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "24px",
              color: "var(--color-ink)",
            }}
          >
            {order.total} {order.currency}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "32px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "40px",
        }}
      >
        {order.statusUrl && (
          <a
            href={order.statusUrl}
            className="mono-cta"
            style={{
              display: "inline-block",
              padding: "18px 36px",
              background: "var(--color-ink)",
              color: "var(--color-surface)",
              borderRadius: "var(--radius-canvas)",
              letterSpacing: "0.08em",
            }}
          >
            Track your order →
          </a>
        )}
        <Link
          href="/standards"
          className="mono-cta"
          style={{
            color: "var(--color-ink)",
            alignSelf: "center",
            transition: "opacity 200ms ease",
          }}
        >
          Verify your batch when it arrives →
        </Link>
      </div>

      <p
        className="mono-body"
        style={{
          fontSize: "12px",
          color: "var(--color-ink-faint)",
          marginTop: "48px",
          maxWidth: "380px",
        }}
      >
        When the box lands: scan the QR beside the seal for your batch&rsquo;s
        lab record and the ritual itself.
      </p>
    </div>
  );
}
