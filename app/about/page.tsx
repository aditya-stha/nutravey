import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Nutravey",
  description:
    "Nutravey is a hydration and multivitamin practice — three considered rituals, formulated for the lives that ask for full attention.",
};

const tenets = [
  {
    label: "01 · Practice",
    title: "Wellness is a ritual, not a regimen.",
    body: "We design for the small daily moment — one sachet, one glass, one minute — because rituals stay and regimens fade.",
  },
  {
    label: "02 · Restraint",
    title: "Less is the formulation.",
    body: "Each sachet carries the minimum it needs to do the work — full electrolytes, a clean vitamin profile, one considered botanical. No stack of forgettables.",
  },
  {
    label: "03 · Composition",
    title: "Three flavours, three intentions.",
    body: "Strawberry for momentum, lychee for composure, lemon for clarity. The collection is small on purpose — chosen, not assembled.",
  },
];

export default function AboutPage() {
  return (
    <>
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
            About
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
            True wellness <br /> begins within.
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
            Nutravey is a hydration and multivitamin practice. We make three
            considered rituals — sachets of fruit, mineral, and vitamin — for
            the lives that ask for full attention.
          </p>
        </div>
        <hr />
      </section>

      {/* Tenets */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <p
            className="mono-label"
            style={{
              color: "var(--color-ink)",
              opacity: 0.5,
              marginBottom: "16px",
            }}
          >
            What we believe
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(36px, 4.5vw, 56px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: "var(--color-ink)",
              maxWidth: "640px",
              marginBottom: "56px",
            }}
          >
            Three tenets, kept short.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "32px",
            }}
            className="about-grid"
          >
            {tenets.map((t) => (
              <article
                key={t.label}
                style={{
                  paddingTop: "24px",
                  borderTop: "0.4px solid var(--color-rule)",
                  maxWidth: "360px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  className="mono-label"
                  style={{
                    color: "var(--color-ink)",
                    opacity: 0.55,
                    marginBottom: "12px",
                  }}
                >
                  {t.label}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "22px",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                    color: "var(--color-ink)",
                    marginBottom: "12px",
                  }}
                >
                  {t.title}
                </h3>
                <p
                  className="mono-body"
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {t.body}
                </p>
              </article>
            ))}
          </div>
        </div>
        <hr />
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{ paddingTop: "96px", paddingBottom: "120px" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(32px, 4vw, 48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: "var(--color-ink)",
              maxWidth: "520px",
              marginBottom: "32px",
            }}
          >
            Begin a ritual.
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
            <Link
              href="/shop"
              className="mono-cta transition-opacity duration-200 hover:opacity-50"
              style={{ color: "var(--color-ink)" }}
            >
              Explore the collection →
            </Link>
            <Link
              href="/standards"
              className="mono-cta transition-opacity duration-200 hover:opacity-50"
              style={{ color: "var(--color-ink)", opacity: 0.6 }}
            >
              Read our standards →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (min-width: 768px) {
          .about-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 48px !important; }
        }
      `}</style>
    </>
  );
}
