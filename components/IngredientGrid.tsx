"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ─── Active formulation — 12 ingredient cells ─────────────────────────
   Universal across products. Two rows: 4 boxes on top, a pill cluster
   + 3 boxes on the bottom. Pixel widths are tuned so each row sums to
   the inner content width (900 - 20 padding - 18 gap = 862 + 18 = 880). */

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const rowOne = [
  { sym: "Vit-C", amt: "152mg", width: 130, kind: "vitamin", tip: "Supports immune defense & collagen synthesis" },
  { sym: "Na",    amt: "290mg", width: 200, kind: "mineral", tip: "Maintains fluid balance during exertion" },
  { sym: "Cl",    amt: "340mg", width: 232, kind: "mineral", tip: "Regulates hydration at cellular level" },
  { sym: "Taurine", amt: "500mg", width: 300, kind: "amino", tip: "Enhances endurance & reduces muscle fatigue" },
] as const;

const rowTwoBoxes: ReadonlyArray<{
  sym: string;
  amt: string;
  width: number;
  kind: "vitamin" | "mineral" | "amino";
  tip: string;
  large?: boolean;
}> = [
  { sym: "Mg", amt: "76mg", width: 174, kind: "mineral", tip: "Prevents cramps & supports muscle function" },
  { sym: "K",  amt: "302mg", width: 232, kind: "mineral", tip: "Essential for heart rhythm & hydration" },
  { sym: "Glycine", amt: "1g", width: 326, kind: "amino", tip: "Promotes deep sleep & joint repair", large: true },
];

const clusterLeftCol = [
  { sym: "Zn",  kind: "mineral", tip: "Speeds recovery & supports immunity" },
  { sym: "B5",  kind: "vitamin", tip: "Converts food into sustained energy" },
  { sym: "B12", kind: "vitamin", tip: "Sharpens focus & nerve function" },
] as const;

const clusterRightCol = [
  { sym: "B3", kind: "vitamin", tip: "Supports metabolic efficiency" },
  { sym: "B6", kind: "vitamin", tip: "Aids amino acid metabolism" },
] as const;

export default function IngredientGrid() {
  const reduce = !!useReducedMotion();

  return (
    <section className="ig-section">
      <div className="ig-rail">
        <motion.p
          className="ig-eyebrow"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          ACTIVE FORMULATION
        </motion.p>
        <motion.h2
          className="ig-headline"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.95, delay: 0.08, ease: EASE }}
        >
          TWELVE ACTIVES.<br />ONE SACHET.
        </motion.h2>
        <motion.p
          className="ig-body"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.16, ease: EASE }}
        >
          Vitamins, minerals, and amino acids — measured to clinical relevance,
          paced to a daily ritual. Hover any cell for what it does.
        </motion.p>

        <motion.div
          className="ig-scroll"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.0, delay: 0.22, ease: EASE }}
        >
          <div className="ig-outer">
            <div className="ig-row" style={{ height: 210 }}>
              {rowOne.map((c) => (
                <div
                  key={c.sym}
                  className={`ig-box ig-${c.kind}`}
                  style={{ flex: c.width }}
                  data-tooltip={c.tip}
                >
                  <span className="ig-sym">{c.sym}</span>
                  <span className="ig-amt">{c.amt}</span>
                </div>
              ))}
            </div>

            <div className="ig-row" style={{ height: 190 }}>
              <div className="ig-cluster" style={{ flex: 130 }}>
                <div className="ig-cluster-col" style={{ flex: 78 }}>
                  {clusterLeftCol.map((p) => (
                    <div
                      key={p.sym}
                      className={`ig-pill ig-${p.kind}`}
                      data-tooltip={p.tip}
                    >
                      {p.sym}
                    </div>
                  ))}
                </div>
                <div
                  className="ig-cluster-col ig-cluster-col--small"
                  style={{ flex: 48 }}
                >
                  {clusterRightCol.map((p) => (
                    <div
                      key={p.sym}
                      className={`ig-pill ig-pill--small ig-${p.kind}`}
                      data-tooltip={p.tip}
                    >
                      {p.sym}
                    </div>
                  ))}
                </div>
              </div>
              {rowTwoBoxes.map((c) => (
                <div
                  key={c.sym}
                  className={`ig-box ig-${c.kind}`}
                  style={{ flex: c.width }}
                  data-tooltip={c.tip}
                >
                  <span className={`ig-sym${c.large ? " ig-sym--large" : ""}`}>
                    {c.sym}
                  </span>
                  <span className="ig-amt">{c.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .ig-section {
          background: var(--color-surface);
          padding: 80px 0 96px;
          position: relative;
        }
        @media (min-width: 1024px) {
          .ig-section { padding: 120px 0 140px; }
        }

        .ig-rail {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 32px;
        }
        @media (min-width: 768px) {
          .ig-rail { padding: 0 48px; }
        }

        /* ── Section typography ──────────────────────────────────── */
        .ig-eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--color-ink) 55%, transparent);
          margin: 0 0 24px;
        }
        .ig-headline {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(40px, 6vw, 84px);
          line-height: 0.96;
          letter-spacing: -0.025em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin: 0 0 28px;
          max-width: 760px;
        }
        .ig-body {
          font-family: var(--font-mono);
          font-size: 14px;
          line-height: 1.6;
          color: color-mix(in srgb, var(--color-ink) 60%, transparent);
          max-width: 560px;
          margin: 0 0 56px;
        }

        /* ── Grid container ──────────────────────────────────────── */
        .ig-scroll {
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
          padding: 56px 0 16px;
          -webkit-overflow-scrolling: touch;
        }

        .ig-outer {
          width: 100%;
          max-width: 1500px;
          height: 426px;
          margin: 0 auto;
          background: color-mix(in srgb, var(--color-ink) 4%, transparent);
          border: 1px solid color-mix(in srgb, var(--color-ink) 35%, transparent);
          border-radius: 28px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif;
          overflow: visible;
        }
        .ig-outer * { box-sizing: border-box; }

        .ig-row {
          display: flex;
          gap: 6px;
        }

        .ig-box {
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          cursor: default;
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .ig-sym {
          font-size: 28px;
          font-weight: 500;
          line-height: 1;
          color: rgba(255, 255, 255, 0.9);
        }
        .ig-sym--large { font-size: 34px; }
        .ig-amt {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 6px;
        }

        /* Pill cluster */
        .ig-cluster {
          display: flex;
          gap: 4px;
          align-items: stretch;
        }
        .ig-cluster-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1 0 auto;
        }
        .ig-cluster-col--small { justify-content: center; }

        .ig-pill {
          flex: 1;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          cursor: default;
          color: rgba(255, 255, 255, 0.9);
          transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ig-pill--small {
          flex: 0 0 46px;
          height: 46px;
          font-size: 12px;
        }

        /* ── Category palette — solid fills ──────────────────────── */
        .ig-vitamin {
          background: rgb(180, 130, 80);
          border: 1px solid rgb(180, 130, 80);
        }
        .ig-vitamin:hover { background: rgb(200, 150, 95); border-color: rgb(200, 150, 95); }

        .ig-mineral {
          background: rgb(180, 100, 80);
          border: 1px solid rgb(180, 100, 80);
        }
        .ig-mineral:hover { background: rgb(200, 120, 95); border-color: rgb(200, 120, 95); }

        .ig-amino {
          background: rgb(180, 80, 140);
          border: 1px solid rgb(180, 80, 140);
        }
        .ig-amino:hover { background: rgb(200, 95, 160); border-color: rgb(200, 95, 160); }

        .ig-box:hover, .ig-pill:hover {
          transform: scale(1.02);
        }

        /* ── Tooltip ─────────────────────────────────────────────── */
        .ig-box[data-tooltip]::after,
        .ig-pill[data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: rgba(255, 255, 255, 0.95);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          color: #1a0a12;
          font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0;
          padding: 8px 16px;
          border-radius: 8px;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
          pointer-events: none;
          z-index: 50;
        }
        .ig-box[data-tooltip]::before,
        .ig-pill[data-tooltip]::before {
          content: '';
          position: absolute;
          bottom: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(255, 255, 255, 0.95);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
          pointer-events: none;
          z-index: 50;
        }
        .ig-box[data-tooltip]:hover::after,
        .ig-pill[data-tooltip]:hover::after,
        .ig-box[data-tooltip]:hover::before,
        .ig-pill[data-tooltip]:hover::before {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
    </section>
  );
}
