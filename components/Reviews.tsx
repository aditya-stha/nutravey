import type { Review } from "@/lib/reviews";
import ReviewForm from "@/components/ReviewForm";

/* ─── PDP reviews section ───────────────────────────────────────────────────
   Server-rendered list (metaobjects + seed) with the verified-buyer form
   below. Stars are typographic — no icon library. */

function Stars({ rating, accent }: { rating: number; accent: string }) {
  return (
    <span
      aria-label={`${rating} out of 5`}
      style={{ color: accent, letterSpacing: "2px", fontSize: "13px" }}
    >
      {"★".repeat(rating)}
      <span style={{ opacity: 0.25 }}>{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function Reviews({
  slug,
  accent,
  reviews,
}: {
  slug: string;
  accent: string;
  reviews: Review[];
}) {
  const avg =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
        ) / 10
      : null;

  return (
    <section style={{ backgroundColor: "var(--color-surface)" }}>
      <div
        className="content-rail"
        style={{ paddingTop: "96px", paddingBottom: "96px" }}
      >
        <p className="mono-label" style={{ color: accent, marginBottom: "16px" }}>
          Reviews{avg ? ` · ${avg} of 5 · ${reviews.length}` : ""}
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(28px, 3.4vw, 40px)",
            letterSpacing: "-0.015em",
            color: "var(--color-ink)",
            marginBottom: "40px",
            maxWidth: "640px",
          }}
        >
          From the people living it.
        </h2>

        {reviews.length === 0 ? (
          <p
            className="mono-body"
            style={{
              fontSize: "14px",
              color: "var(--color-ink-muted)",
              maxWidth: "460px",
              marginBottom: "48px",
            }}
          >
            No reviews yet — the first batch hasn&rsquo;t reached its people.
            Verified reviews open once orders arrive.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: "0 0 48px",
              padding: 0,
              maxWidth: "720px",
              borderTop: "0.4px solid var(--color-rule)",
            }}
          >
            {reviews.map((r, i) => (
              <li
                key={`${r.author}-${i}`}
                style={{
                  padding: "24px 0",
                  borderBottom: "0.4px solid var(--color-rule)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "8px",
                  }}
                >
                  <Stars rating={r.rating} accent={accent} />
                  {r.title && (
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 500,
                        fontSize: "17px",
                        color: "var(--color-ink)",
                      }}
                    >
                      {r.title}
                    </span>
                  )}
                </div>
                <p
                  className="mono-body"
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color: "var(--color-ink-muted)",
                    maxWidth: "560px",
                    marginBottom: "10px",
                  }}
                >
                  {r.body}
                </p>
                <p className="mono-label" style={{ fontSize: "10px", color: "var(--color-ink-faint)" }}>
                  {r.author}
                  {r.date ? ` · ${r.date}` : ""}
                  {r.verified && (
                    <span style={{ color: accent }}> · Verified buyer</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}

        <ReviewForm slug={slug} accent={accent} />
      </div>
      <hr />
    </section>
  );
}
