import Link from "next/link";
import type { Batch } from "@/lib/batches";
import { getProduct } from "@/lib/products";

/* ─── Batch record card ─────────────────────────────────────────────────────
   The lab-evidence panel for one production lot — production facts and
   third-party test rows, set like the supplement-facts tables. Hook-free so
   it renders in the /standards lookup (client) and /ritual/<lot> (server)
   identically. */

export default function BatchRecord({
  batch,
  showRitualLink = true,
}: {
  batch: Batch;
  showRitualLink?: boolean;
}) {
  const product = getProduct(batch.flavourSlug);

  return (
    <div className="batch-card">
      <div className="batch-card-head">
        <div>
          <p
            className="mono-label"
            style={{ color: product.accent, marginBottom: "4px" }}
          >
            {product.name} · {batch.stage} batch
          </p>
          <p className="batch-lot">{batch.lot}</p>
        </div>
        <span className="mono-label batch-verified">Verified</span>
      </div>

      <dl className="batch-facts">
        <div className="batch-fact">
          <dt className="mono-label">Produced</dt>
          <dd className="mono-body">{batch.produced}</dd>
        </div>
        <div className="batch-fact">
          <dt className="mono-label">Facility</dt>
          <dd className="mono-body">{batch.facility}</dd>
        </div>
        <div className="batch-fact">
          <dt className="mono-label">Tested</dt>
          <dd className="mono-body">
            {batch.tested} · {batch.lab}
          </dd>
        </div>
      </dl>

      <ul className="batch-tests">
        {batch.tests.map((t) => (
          <li key={t.panel} className="batch-test">
            <span className="mono-cta">{t.panel}</span>
            <span className="mono-body batch-test-detail">{t.detail}</span>
            <span
              className="mono-label"
              style={{
                color:
                  t.result === "Pass"
                    ? "var(--color-ink)"
                    : "var(--color-ink-faint)",
              }}
            >
              {t.result}
            </span>
          </li>
        ))}
      </ul>

      <div className="batch-card-foot">
        {batch.coaUrl ? (
          <a href={batch.coaUrl} className="mono-cta batch-link">
            Full certificate of analysis (PDF) →
          </a>
        ) : (
          <p className="mono-body batch-note">
            Full lab certificate publishes with production Batch 01.
          </p>
        )}
        {showRitualLink && (
          <Link href={`/ritual/${batch.lot}`} className="mono-cta batch-link">
            Open this batch&rsquo;s ritual page →
          </Link>
        )}
      </div>

      <style>{`
        .batch-card {
          border: 0.4px solid var(--color-rule);
          border-radius: var(--radius-canvas);
          padding: 28px;
          background: var(--color-surface-card);
          text-align: left;
        }
        .batch-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 0.4px solid var(--color-rule);
        }
        .batch-lot {
          font-family: var(--font-mono);
          font-size: 20px;
          letter-spacing: 0.12em;
          color: var(--color-ink);
        }
        .batch-verified {
          color: var(--color-ink);
          border: 0.4px solid var(--color-rule);
          border-radius: var(--radius-chip);
          padding: 4px 10px;
          white-space: nowrap;
        }

        .batch-facts { margin: 0; padding: 20px 0; display: grid; gap: 12px; }
        .batch-fact { display: flex; gap: 16px; align-items: baseline; }
        .batch-fact dt { color: var(--color-ink-faint); min-width: 88px; }
        .batch-fact dd { margin: 0; font-size: 13px; color: var(--color-ink); }

        .batch-tests { list-style: none; margin: 0; padding: 0; }
        .batch-test {
          display: grid;
          grid-template-columns: 160px 1fr auto;
          gap: 16px;
          align-items: baseline;
          padding: 12px 0;
          border-top: 0.4px solid var(--color-rule);
        }
        .batch-test-detail { font-size: 12px; color: var(--color-ink-muted); }
        @media (max-width: 640px) {
          .batch-test { grid-template-columns: 1fr auto; }
          .batch-test-detail { grid-column: 1 / -1; }
        }

        .batch-card-foot {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 32px;
          padding-top: 20px;
          border-top: 0.4px solid var(--color-rule);
        }
        .batch-link { color: var(--color-ink); transition: opacity 200ms ease; }
        .batch-link:hover { opacity: 0.6; }
        .batch-note { font-size: 12px; color: var(--color-ink-faint); }
      `}</style>
    </div>
  );
}
