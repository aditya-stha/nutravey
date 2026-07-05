"use client";

/* ─── Batch lookup — /standards ─────────────────────────────────────────────
   Lot number (printed on the box) → that batch's record, inline. The full
   verification experience lives at /ritual/<lot>; this is the evidence desk
   version. Data ships with the bundle (lib/batches.ts) — lookup is instant
   and works offline. */

import { useState } from "react";
import { findBatch, type Batch } from "@/lib/batches";
import BatchRecord from "@/components/BatchRecord";

export default function BatchLookup() {
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const hit = findBatch(query);
    setBatch(hit ?? null);
    setNotFound(!hit);
  };

  return (
    <div className="batch-lookup">
      <form onSubmit={lookup} className="batch-form">
        <label htmlFor="lot-input" className="mono-label batch-label">
          Lot number — printed beside the seal
        </label>
        <div className="batch-input-row">
          <input
            id="lot-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setNotFound(false);
            }}
            placeholder="NVY-ST-2606"
            autoComplete="off"
            spellCheck={false}
            className="mono-body batch-input"
          />
          <button type="submit" className="mono-cta batch-verify">
            Verify
          </button>
        </div>
      </form>

      {notFound && (
        <p role="alert" className="mono-body batch-miss">
          That lot isn&rsquo;t in our registry. Check the number against the
          box — and if it still doesn&rsquo;t resolve, the product may not be
          genuine. Write to us before using it.
        </p>
      )}

      {batch && (
        <div style={{ marginTop: "32px" }}>
          <BatchRecord batch={batch} />
        </div>
      )}

      <style>{`
        .batch-lookup { max-width: 720px; }
        .batch-label {
          display: block;
          color: var(--color-ink);
          opacity: 0.55;
          margin-bottom: 12px;
        }
        .batch-input-row { display: flex; gap: 12px; }
        .batch-input {
          flex: 1;
          max-width: 320px;
          padding: 14px 16px;
          font-size: 14px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-ink);
          background: var(--color-surface);
          border: 0.4px solid var(--color-rule);
        }
        .batch-input:focus { outline: none; border-color: var(--color-ink); }
        .batch-verify {
          padding: 14px 28px;
          background: var(--color-ink);
          color: var(--color-surface);
          border: none;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: opacity 200ms ease;
        }
        .batch-verify:hover { opacity: 0.85; }

        .batch-miss {
          margin-top: 20px;
          max-width: 460px;
          font-size: 13px;
          line-height: 1.65;
          color: var(--color-strawberry);
          border-top: 0.4px solid var(--color-rule);
          padding-top: 14px;
        }
      `}</style>
    </div>
  );
}
