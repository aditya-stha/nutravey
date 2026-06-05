import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/lib/products";
import DiscoveryGallery from "@/components/DiscoveryGallery";

export const metadata: Metadata = {
  title: "Discovery — Nutravey",
  description:
    "Find your ritual. Three flavours, three intentions — a brief guide to the Nutravey collection.",
};

const intents = [
  {
    eyebrow: "For the morning",
    title: "Vitality.",
    body: "When the day asks for momentum — training, travel, early calls — Strawberry Surge restores what motion depletes.",
    slug: "strawberry-surge",
    cta: "Begin with Strawberry",
  },
  {
    eyebrow: "For the afternoon",
    title: "Radiance.",
    body: "When the day asks for composure — a quiet hour, a long focus, a screen-lit stretch — Lychee Lush carries the middle without lift.",
    slug: "lychee-lush",
    cta: "Discover Lychee",
  },
  {
    eyebrow: "For clarity",
    title: "Clarity.",
    body: "When the day asks for thought — a study session, a difficult email, a single difficult sentence — Lemon Zest sharpens without the spike.",
    slug: "lemon-zest",
    cta: "Explore Lemon",
  },
];

export default function DiscoveryPage() {
  return (
    <>
      <DiscoveryGallery />

      {/* Hero */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{ paddingTop: "112px", paddingBottom: "64px" }}
        >
          <p
            className="mono-label"
            style={{
              color: "var(--color-ink)",
              opacity: 0.5,
              marginBottom: "20px",
            }}
          >
            Discovery
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(56px, 9vw, 112px)",
              letterSpacing: "-0.025em",
              lineHeight: 0.96,
              color: "var(--color-ink)",
              marginBottom: "32px",
              maxWidth: "900px",
            }}
          >
            Revive your ritual.
          </h1>
          <p
            className="mono-body"
            style={{
              maxWidth: "560px",
              fontSize: "17px",
              lineHeight: 1.65,
              color: "var(--color-ink-muted)",
            }}
          >
            Three flavours. Three intentions. Choose by the day, not the
            diagnosis — and let the ritual fit the hour you’re in.
          </p>
        </div>
        <hr />
      </section>

      {/* Three intentions, each linked to a product */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {intents.map((i, idx) => {
              const product = products.find((p) => p.slug === i.slug)!;
              return (
                <li
                  key={i.slug}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "16px",
                    paddingTop: "48px",
                    paddingBottom: "48px",
                    borderTop:
                      idx === 0 ? "0.4px solid var(--color-rule)" : "none",
                    borderBottom: "0.4px solid var(--color-rule)",
                  }}
                  className="discovery-row"
                >
                  <span
                    className="mono-label"
                    style={{ color: product.accent }}
                  >
                    0{idx + 1} · {i.eyebrow}
                  </span>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: "clamp(40px, 5.5vw, 64px)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.0,
                      color: "var(--color-ink)",
                    }}
                  >
                    {i.title}
                  </h2>
                  <p
                    className="mono-body"
                    style={{
                      maxWidth: "560px",
                      fontSize: "15px",
                      lineHeight: 1.65,
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {i.body}
                  </p>
                  <Link
                    href={`/products/${i.slug}`}
                    className="mono-cta"
                    style={{
                      color: product.accent,
                      paddingBottom: "4px",
                      alignSelf: "flex-start",
                    }}
                  >
                    {i.cta} →
                  </Link>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: "64px" }}>
            <Link
              href="/shop"
              className="mono-cta transition-opacity duration-200 hover:opacity-50"
              style={{ color: "var(--color-ink)" }}
            >
              Or explore the full collection →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
