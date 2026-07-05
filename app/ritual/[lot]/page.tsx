import type { Metadata } from "next";
import Link from "next/link";
import { batches, findBatch } from "@/lib/batches";
import { getProduct } from "@/lib/products";
import { isPreLaunch } from "@/lib/shopify-config";
import BatchRecord from "@/components/BatchRecord";
import SystemPage from "@/components/SystemPage";

/* ─── /ritual/<lot> — the QR target printed on every box ───────────────────
   Physical product → digital proof: batch verification, that run's lab
   record, the flavour's ritual, and a one-tap refill. Known lots prerender;
   unknown lots stay dynamic so they get the anti-counterfeit warning rather
   than a generic 404. */

export function generateStaticParams() {
  return batches.map((b) => ({ lot: b.lot }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lot: string }>;
}): Promise<Metadata> {
  const batch = findBatch(decodeURIComponent((await params).lot));
  return {
    title: batch
      ? `Batch ${batch.lot} — Nutravey`
      : "Batch verification — Nutravey",
    robots: { index: false, follow: false },
  };
}

export default async function RitualPage({
  params,
}: {
  params: Promise<{ lot: string }>;
}) {
  const raw = decodeURIComponent((await params).lot);
  const batch = findBatch(raw);

  if (!batch) {
    return (
      <SystemPage
        eyebrow="Ritual Verification"
        heading="This lot isn't recognized."
        copy={`"${raw.slice(0, 24).toUpperCase()}" doesn't match any batch in our registry. Check the number printed beside the seal — if it still doesn't resolve, the product may not be genuine. Write to us before using it.`}
      >
        <Link href="/standards" className="system-home-link mono-cta">
          Our standards &amp; batch registry →
        </Link>
      </SystemPage>
    );
  }

  const product = getProduct(batch.flavourSlug);
  const refillHref = isPreLaunch
    ? `/shop?item=${product.id}`
    : `/products/${product.slug}`;

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
        Ritual Verification
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(40px, 6vw, 72px)",
          letterSpacing: "-0.03em",
          lineHeight: 0.98,
          color: "var(--color-ink)",
          marginBottom: "16px",
          maxWidth: "680px",
        }}
      >
        This box is genuine.
      </h1>
      <p
        className="mono-body"
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "var(--color-ink-muted)",
          maxWidth: "440px",
          marginBottom: "48px",
        }}
      >
        Lot {batch.lot} — {product.name}, produced {batch.produced} and
        cleared by an independent laboratory. Its full record is below;
        nothing to take on faith.
      </p>

      <div style={{ width: "100%", maxWidth: "640px" }}>
        <BatchRecord batch={batch} showRitualLink={false} />
      </div>

      {/* The ritual — this flavour's usage sequence */}
      <p
        className="mono-label"
        style={{
          color: product.accent,
          marginTop: "72px",
          marginBottom: "20px",
        }}
      >
        The {product.flavour} Ritual
      </p>
      <ol
        style={{
          listStyle: "none",
          margin: "0 0 64px",
          padding: 0,
          maxWidth: "480px",
          width: "100%",
          borderTop: "0.4px solid var(--color-rule)",
        }}
      >
        {product.usage.map((step, i) => (
          <li
            key={step}
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "baseline",
              textAlign: "left",
              padding: "16px 0",
              borderBottom: "0.4px solid var(--color-rule)",
            }}
          >
            <span
              className="mono-label"
              style={{ color: product.accent, minWidth: "24px" }}
            >
              0{i + 1}
            </span>
            <span
              className="mono-body"
              style={{ fontSize: "14px", color: "var(--color-ink)" }}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>

      {/* One-tap refill. Lemon is the one light accent — ink text on it,
          cream on the others. */}
      <Link
        href={refillHref}
        className="mono-cta"
        style={{
          display: "inline-block",
          padding: "18px 40px",
          background: product.accent,
          color: product.id === "lemon" ? "var(--color-oxblood)" : "#FAFAFA",
          borderRadius: "var(--radius-canvas)",
          letterSpacing: "0.08em",
        }}
      >
        {isPreLaunch
          ? `Reserve your next month of ${product.flavour} →`
          : `Running low? Refill ${product.name} →`}
      </Link>
      <p
        className="mono-body"
        style={{
          fontSize: "11px",
          color: "var(--color-ink-faint)",
          marginTop: "16px",
        }}
      >
        {product.servings} sachets · {product.priceLabel} · one month of the
        ritual
      </p>
    </div>
  );
}
