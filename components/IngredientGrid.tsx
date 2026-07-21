"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* ─── Active formulation — V2 treemap infographic ──────────────────────
   Exact tile sizes come from the approved spec. Two colours only: a deep-
   plum panel, and gradient-swirl fills in every tile (no category tints).

   Each tile is overflow:visible so its tooltip can escape; the swirling
   gradient lives in an inner .ig-glow layer that clips it instead. The
   scroll wrapper carries top padding so top-row tooltips have room to
   rise into. Desktop-first; a narrow viewport scrolls horizontally. */

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* Per-tile swirl timing so no two glows move in lockstep. */
const SWIRL_DUR = [13, 17, 15, 19, 14, 21, 16, 18, 20, 12, 22, 15] as const;
function swirl(i: number): CSSProperties {
  return {
    ["--dur" as string]: `${SWIRL_DUR[i % SWIRL_DUR.length]}s`,
    ["--delay" as string]: `-${((i * 2.7) % 11).toFixed(1)}s`,
    ["--dir" as string]: i % 2 ? "reverse" : "normal",
  };
}

interface Box {
  w: string;
  sym: string;
  amt: string;
  tip: string;
  big?: boolean;
}

const rowTop: Box[] = [
  { w: "w-vitc", sym: "Vit-C", amt: "150mg", tip: "Supports immune defense & collagen synthesis" },
  { w: "w-na",   sym: "Na",    amt: "100mg", tip: "Maintains fluid balance during exertion" },
  { w: "w-cl",   sym: "Cl",    amt: "631mg", tip: "Regulates hydration at cellular level" },
  { w: "w-tau",  sym: "Tau",   amt: "500mg", tip: "Enhances endurance & reduces muscle fatigue" },
];

const rowBottom: Box[] = [
  { w: "w-ca",  sym: "Ca",  amt: "150mg", tip: "Supports bone strength & muscle contraction" },
  { w: "w-mg",  sym: "Mg",  amt: "47mg",  tip: "Prevents cramps & supports muscle function" },
  { w: "w-k",   sym: "K",   amt: "525mg", tip: "Essential for heart rhythm & hydration" },
  { w: "w-gly", sym: "Gly", amt: "1g",    tip: "Promotes deep sleep & joint repair", big: true },
];

const pillRows: { cls: string; pills: { sym: string; tip: string; tiny?: boolean }[] }[] = [
  { cls: "pill-row-lg", pills: [
    { sym: "B5", tip: "Converts food into sustained energy" },
    { sym: "B3", tip: "Supports metabolic efficiency" },
  ] },
  { cls: "pill-row-md", pills: [
    { sym: "Zn", tip: "Speeds recovery & supports immunity" },
    { sym: "B6", tip: "Aids amino acid metabolism" },
  ] },
  { cls: "pill-row-sm", pills: [
    { sym: "B12", tip: "Sharpens focus & nerve function", tiny: true },
  ] },
];

export default function IngredientGrid() {
  const reduce = !!useReducedMotion();
  let n = 0; // running index feeding swirl() so every tile differs

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
          <div className="outer">
            <div className="row row-top">
              {rowTop.map((b) => (
                <div
                  key={b.sym}
                  className={`box ${b.w}`}
                  style={swirl(n++)}
                  data-tooltip={b.tip}
                >
                  <span className="ig-glow" aria-hidden="true" />
                  <span className="sym">{b.sym}</span>
                  <span className="amt">{b.amt}</span>
                </div>
              ))}
            </div>

            <div className="row row-bottom">
              <div className="cluster">
                {pillRows.map((pr) => (
                  <div key={pr.cls} className={`pill-row ${pr.cls}`}>
                    {pr.pills.map((p) => (
                      <div
                        key={p.sym}
                        className={`pill${p.tiny ? " pill-tiny" : ""}`}
                        style={swirl(n++)}
                        data-tooltip={p.tip}
                      >
                        <span className="ig-glow" aria-hidden="true" />
                        <span className="pill-label">{p.sym}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {rowBottom.map((b) => (
                <div
                  key={b.sym}
                  className={`box ${b.w}`}
                  style={swirl(n++)}
                  data-tooltip={b.tip}
                >
                  <span className="ig-glow" aria-hidden="true" />
                  <span className={`sym${b.big ? " sym-big" : ""}`}>{b.sym}</span>
                  <span className="amt">{b.amt}</span>
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

        /* ── Scroll wrapper — top padding gives tooltips room to rise ─ */
        .ig-scroll {
          width: 100%;
          overflow-x: auto;
          padding: 64px 0 24px;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Exact spec sizes ──────────────────────────────────────── */
        .outer {
          width: 900px;
          height: 342px;
          margin: 0 auto;
          background: #321027;
          border: 1px solid #1A0714;
          border-radius: 28px;
          padding: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .outer * { box-sizing: border-box; }
        .row { display: flex; gap: 6px; }
        .row-top { height: 166px; }
        .row-bottom { height: 150px; }

        .box {
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: visible;               /* let the tooltip escape */
          cursor: default;
          background: #26091C;
          border: 1px solid #150610;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .sym {
          position: relative;
          z-index: 1;
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          color: rgba(255, 255, 255, 0.96);
        }
        .sym-big { font-size: 32px; }
        .amt {
          position: relative;
          z-index: 1;
          font-family: var(--font-mono);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          margin-top: 6px;
        }

        .w-vitc { width: 130px; }
        .w-na   { width: 160px; }
        .w-cl   { width: 230px; }
        .w-tau  { width: 360px; }
        .w-ca   { width: 140px; }
        .w-mg   { width: 130px; }
        .w-k    { width: 200px; }
        .w-gly  { width: 218px; }

        /* ── Vitamin cluster (exact spec) ──────────────────────────── */
        .cluster {
          width: 170px;
          height: 150px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: stretch;
        }
        .pill-row { display: flex; gap: 4px; }
        .pill-row-lg { height: 64px; }
        .pill-row-md { height: 46px; }
        .pill-row-sm { height: 28px; justify-content: center; }
        .pill {
          flex: 1;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-weight: 700;
          position: relative;
          overflow: visible;
          cursor: default;
          background: #26091C;
          border: 1px solid #150610;
          color: rgba(255, 255, 255, 0.92);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .pill-label { position: relative; z-index: 1; }
        .pill-row-lg .pill { font-size: 16px; }
        .pill-row-md .pill { font-size: 13px; }
        .pill-tiny { flex: 0 0 56px; font-size: 10px; }

        /* ── Gradient swirl (clipped inner layer) ──────────────────── */
        .ig-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          border-radius: inherit;
          overflow: hidden;                /* clips the swirl to the tile */
          pointer-events: none;
        }
        .ig-glow::before {
          content: '';
          position: absolute;
          inset: -25%;
          background:
            radial-gradient(circle at 30% 30%, #F0567F 0%, transparent 52%),
            radial-gradient(circle at 72% 42%, #C46AD6 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, #E7C24C 0%, transparent 54%);
          filter: blur(16px) saturate(1.1);
          opacity: 0.72;
          will-change: transform;
          animation: ig-swirl var(--dur, 16s) linear var(--delay, 0s) infinite;
          animation-direction: var(--dir, normal);
        }
        @keyframes ig-swirl {
          0%   { transform: rotate(0deg)   scale(1.05); }
          50%  { transform: rotate(180deg) scale(1.18); }
          100% { transform: rotate(360deg) scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ig-glow::before { animation: none; transform: scale(1.1); }
        }

        .box:hover, .pill:hover {
          transform: scale(1.015);
          border-color: color-mix(in srgb, #FFFFFF 22%, #150610);
        }
        .box:hover .ig-glow::before,
        .pill:hover .ig-glow::before {
          opacity: 0.92;
          filter: blur(14px) brightness(1.15) saturate(1.15);
        }

        /* ── Tooltip (escapes the tile; wraps so it never runs off) ── */
        .box[data-tooltip]::after,
        .pill[data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          width: max-content;
          max-width: 240px;
          background: rgba(255, 255, 255, 0.97);
          color: #1a0a12;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          text-align: center;
          padding: 8px 14px;
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
          pointer-events: none;
          z-index: 50;
        }
        .box[data-tooltip]::before,
        .pill[data-tooltip]::before {
          content: '';
          position: absolute;
          bottom: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(255, 255, 255, 0.97);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
          pointer-events: none;
          z-index: 50;
        }
        .box[data-tooltip]:hover::after,
        .pill[data-tooltip]:hover::after,
        .box[data-tooltip]:hover::before,
        .pill[data-tooltip]:hover::before {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
    </section>
  );
}
