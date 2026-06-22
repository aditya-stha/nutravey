"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface Slide {
  src: string;
  alt: string;
  topic: string;
  quote: string;
}

const slides: Slide[] = [
  {
    src: "/Post%201.png",
    alt: "Runner mid-stride at first light",
    topic: "On Discipline",
    quote: "Before the world catches up.",
  },
  {
    src: "/Post%202.png",
    alt: "Tennis player resting court-side with racket and ball",
    topic: "On Hydration",
    quote: "Restored, between sets.",
  },
  {
    src: "/Post%203.png",
    alt: "Two athletes side by side",
    topic: "On Connection",
    quote: "Shared rituals, sharper edges.",
  },
  {
    src: "/Post%204.png",
    alt: "Empty tennis court at dusk",
    topic: "On Focus",
    quote: "First, the inside. Then the line.",
  },
  {
    src: "/Post%205.png",
    alt: "Woman holding a pilates pose",
    topic: "On Form",
    quote: "Form holds. Hydration follows.",
  },
];

export default function Posters() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const current = slides[index];
  const total = slides.length;
  const indexLabel = String(index + 1).padStart(2, "0");

  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + total) % total);
  }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section className="posters-section" aria-roledescription="carousel">
      <div className="posters-grid">
        {/* Left half — poster */}
        <div className="posters-image-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.src}
              className="posters-image-inner"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className="posters-image"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>

          <div className="posters-image-meta" aria-hidden="true">
            <span className="posters-image-meta-num">{indexLabel}</span>
            <span className="posters-image-meta-slash">/</span>
            <span className="posters-image-meta-total">{String(total).padStart(2, "0")}</span>
          </div>
        </div>

        {/* Right half — quote */}
        <div className="posters-text-col">
          <div className="posters-text-inner">
            <p className="mono-label posters-eyebrow">
              Field Notes · No. {indexLabel}
            </p>

            <div className="posters-quote-wrap">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={current.quote}
                  className="posters-quote"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  &ldquo;{current.quote}&rdquo;
                </motion.blockquote>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={`topic-${index}`}
                className="posters-topic"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                — {current.topic}
              </motion.p>
            </AnimatePresence>

            <div className="posters-controls">
              <div className="posters-dots" role="tablist" aria-label="Choose poster">
                {slides.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    className="posters-dot"
                    data-active={i === index || undefined}
                    onClick={() => setIndex(i)}
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show poster ${i + 1}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>

              <div className="posters-arrows">
                <button
                  type="button"
                  className="posters-arrow"
                  onClick={() => go(-1)}
                  aria-label="Previous poster"
                >
                  <span aria-hidden="true">&larr;</span>
                </button>
                <button
                  type="button"
                  className="posters-arrow posters-arrow-next"
                  onClick={() => go(1)}
                  aria-label="Next poster"
                >
                  Next <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .posters-section {
          background: var(--color-surface-warm);
          color: var(--color-ink);
          border-top: 0.4px solid var(--color-rule);
        }

        .posters-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
        }

        /* ── Left: image ──────────────────────────────────────── */
        .posters-image-col {
          position: relative;
          overflow: hidden;
          background: var(--color-aubergine-deep);
          /* Posters are 2160×2700 (4:5). Lock the column to that ratio so the
             image fills it without cropping, regardless of viewport width. */
          aspect-ratio: 4 / 5;
        }

        .posters-image-inner {
          position: absolute;
          inset: 0;
        }

        .posters-image {
          object-fit: cover;
        }

        .posters-image-meta {
          position: absolute;
          left: 24px;
          bottom: 22px;
          z-index: 2;
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          color: #FAFAFA;
          mix-blend-mode: difference;
          pointer-events: none;
        }
        .posters-image-meta-slash,
        .posters-image-meta-total { opacity: 0.65; }

        /* ── Right: text ──────────────────────────────────────── */
        .posters-text-col {
          display: flex;
          align-items: center;
          padding: 80px clamp(40px, 6vw, 104px);
          border-left: 0.4px solid var(--color-rule);
          min-width: 0;
        }

        .posters-text-inner {
          width: 100%;
          max-width: 560px;
        }

        .posters-eyebrow {
          color: var(--color-ink);
          opacity: 0.45;
          margin: 0 0 36px;
        }

        .posters-quote-wrap {
          position: relative;
          min-height: clamp(160px, 22vh, 280px);
        }

        .posters-quote {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(28px, 3.4vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.015em;
          color: var(--color-ink);
          margin: 0;
          padding: 0;
          quotes: none;
          transform-origin: left top;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                      letter-spacing 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: default;
        }
        .posters-quote:hover {
          transform: scale(1.055);
          letter-spacing: -0.005em;
        }

        .posters-topic {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-ink-muted);
          margin: 24px 0 0;
        }

        /* ── Controls ─────────────────────────────────────────── */
        .posters-controls {
          margin-top: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .posters-dots {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .posters-dot {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 8px 6px;
          color: var(--color-ink-faint);
          font: inherit;
          letter-spacing: inherit;
          text-transform: inherit;
          cursor: pointer;
          position: relative;
          transition: color 0.25s ease;
        }
        .posters-dot::after {
          content: "";
          position: absolute;
          left: 6px;
          right: 6px;
          bottom: 2px;
          height: 0.5px;
          background: currentColor;
          opacity: 0;
          transform: scaleX(0.5);
          transform-origin: left center;
          transition: opacity 0.25s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .posters-dot:hover { color: var(--color-ink); }
        .posters-dot[data-active] {
          color: var(--color-ink);
        }
        .posters-dot[data-active]::after {
          opacity: 1;
          transform: scaleX(1);
        }

        .posters-arrows {
          display: inline-flex;
          align-items: center;
          gap: 18px;
        }

        .posters-arrow {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 8px 0;
          color: var(--color-ink);
          font: inherit;
          letter-spacing: inherit;
          text-transform: inherit;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.25s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .posters-arrow:hover {
          color: var(--color-strawberry);
        }
        .posters-arrow:hover span {
          transform: translateX(2px);
        }
        .posters-arrow:not(.posters-arrow-next):hover span {
          transform: translateX(-2px);
        }
        .posters-arrow span {
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1);
          display: inline-block;
        }
        .posters-arrow:focus-visible {
          outline: 1px solid var(--color-ink);
          outline-offset: 4px;
        }

        /* ── Responsive ───────────────────────────────────────── */
        @media (max-width: 900px) {
          .posters-grid {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .posters-image-col {
            aspect-ratio: 4 / 5;
          }
          .posters-text-col {
            border-left: 0;
            border-top: 0.4px solid var(--color-rule);
            padding: 56px 32px 64px;
          }
          .posters-quote-wrap {
            min-height: clamp(140px, 28vh, 240px);
          }
          .posters-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 32px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .posters-quote { transition: none; }
          .posters-arrow span { transition: none; }
        }
      `}</style>
    </section>
  );
}
