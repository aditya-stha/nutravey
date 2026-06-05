import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Standards — Nutravey",
  description:
    "Our standards: third-party tested, no synthetic dyes, no proprietary blends, no marketing-only ingredients.",
};

const standards = [
  {
    label: "Sourcing",
    body: "Botanicals are sourced from named-origin growers. Minerals are pharmaceutical grade. Where a single supplier owns a category, we test multiple lots before approving any of them.",
  },
  {
    label: "Testing",
    body: "Every batch is third-party tested for heavy metals, microbial load, and label accuracy. We publish our certificates of analysis on request — no membership required.",
  },
  {
    label: "Disclosure",
    body: "No proprietary blends. The label is the formulation. If a milligram is on the back of the sachet, it is in the sachet.",
  },
];

const exclusions = [
  "No synthetic dyes",
  "No artificial sweeteners",
  "No proprietary blends",
  "No PFAS-lined packaging",
  "No undisclosed flavour systems",
  "No marketing-only ingredients",
];

export default function StandardsPage() {
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
            Standards
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
            What’s on the label is in the sachet.
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
            We don’t believe in hidden blends, marketing-only milligrams, or
            certifications you can’t verify. Three commitments, in plain
            language.
          </p>
        </div>
        <hr />
      </section>

      {/* Three commitments */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{ paddingTop: "96px", paddingBottom: "96px" }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {standards.map((s, i) => (
              <li
                key={s.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                  paddingTop: "40px",
                  paddingBottom: "40px",
                  borderTop:
                    i === 0 ? "0.4px solid var(--color-rule)" : "none",
                  borderBottom: "0.4px solid var(--color-rule)",
                }}
                className="standards-row"
              >
                <span
                  className="mono-label"
                  style={{ color: "var(--color-ink)", opacity: 0.55 }}
                >
                  0{i + 1}
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "clamp(28px, 3.4vw, 40px)",
                    letterSpacing: "-0.015em",
                    lineHeight: 1.05,
                    color: "var(--color-ink)",
                  }}
                >
                  {s.label}
                </h2>
                <p
                  className="mono-body"
                  style={{
                    maxWidth: "640px",
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {s.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <hr />
      </section>

      {/* Exclusions */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{ paddingTop: "96px", paddingBottom: "120px" }}
        >
          <p
            className="mono-label"
            style={{
              color: "var(--color-ink)",
              opacity: 0.5,
              marginBottom: "16px",
            }}
          >
            What you won’t find
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
              marginBottom: "40px",
            }}
          >
            Six omissions, by design.
          </h2>
          <ul
            style={{
              listStyle: "none",
              margin: "0 0 56px",
              padding: 0,
              borderTop: "0.4px solid var(--color-rule)",
              maxWidth: "720px",
            }}
          >
            {exclusions.map((e) => (
              <li
                key={e}
                className="mono-body"
                style={{
                  padding: "14px 0",
                  borderBottom: "0.4px solid var(--color-rule)",
                  fontSize: "14px",
                  color: "var(--color-ink)",
                }}
              >
                {e}
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            className="mono-cta transition-opacity duration-200 hover:opacity-50"
            style={{ color: "var(--color-ink)" }}
          >
            Explore the collection →
          </Link>
        </div>
      </section>
    </>
  );
}
