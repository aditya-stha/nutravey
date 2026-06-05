"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface RitualCard {
  src: string;
  alt: string;
  label: string;
  title: string;
  description: string;
  x: string;       // horizontal offset from center
  y: string;       // vertical offset (arc curve)
  rotate: string;  // rotation angle
  z: number;       // z-index
}

const cards: RitualCard[] = [
  {
    src: "/images/archetypes/athlete.jpg",
    alt: "Athlete in early-morning training",
    label: "MORNING",
    title: "THE MORNING LIFT",
    description: "Start before the world catches up.",
    x: "-540px",
    y: "90px",
    rotate: "-18deg",
    z: 8,
  },
  {
    src: "/images/archetypes/musician.jpg",
    alt: "Musician under stage lighting",
    label: "LATE NIGHT",
    title: "THE LATE-NIGHT SET",
    description: "When the room finds its rhythm.",
    x: "-270px",
    y: "24px",
    rotate: "-9deg",
    z: 9,
  },
  {
    src: "/images/archetypes/coder.jpg",
    alt: "Developer in long-focus session",
    label: "LONG FOCUS",
    title: "THE LONG FOCUS",
    description: "Deep work deserves deep fuel.",
    x: "0px",
    y: "0px",
    rotate: "0deg",
    z: 10,
  },
  {
    src: "/images/archetypes/artist.jpg",
    alt: "Artist at the workbench",
    label: "THE CRAFT",
    title: "THE CONSIDERED CRAFT",
    description: "Measure twice. Create once.",
    x: "270px",
    y: "24px",
    rotate: "9deg",
    z: 9,
  },
  {
    src: "/images/archetypes/executive.jpg",
    alt: "Executive making early decisions",
    label: "DECISIONS",
    title: "THE BIG DECISIONS",
    description: "Clarity for the calls that matter.",
    x: "540px",
    y: "90px",
    rotate: "18deg",
    z: 8,
  },
];

export default function BrandIdentity() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex]);

  const active = openIndex !== null ? cards[openIndex] : null;

  return (
    <section className="rituals-section">
      {/* ── Arc of cards ─────────────────────────────────────── */}
      <div className="arc-container">
        <div className="arc-stage">
          {cards.map((c, i) => (
            <button
              key={i}
              type="button"
              className="rcard"
              style={{
                "--card-x": c.x,
                "--card-y": c.y,
                "--card-r": c.rotate,
                zIndex: c.z,
              } as CSSProperties}
              onClick={() => setOpenIndex(i)}
              aria-label={`Open ${c.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.src} alt={c.alt} />
              <span className="rcard-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Text block ───────────────────────────────────────── */}
      <div className="rituals-copy">
        <p className="rituals-tag">FOR YOUR DAILY MOMENT</p>
        <h2 className="rituals-headline">
          RITUALS<br />WORTH KEEPING.
        </h2>
        <p className="rituals-body">
          Made for the moments that ask for your full attention.
          Five rituals. Three flavours. One quiet reset.
        </p>
        <Link href="/shop" className="rituals-cta">
          FIND YOUR RITUAL &rarr;
        </Link>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="ritual-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setOpenIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
          >
            <motion.div
              className="ritual-modal"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.src} alt={active.alt} className="ritual-image" />
              <div className="ritual-meta">
                <h3 className="ritual-title">{active.title}</h3>
                <p className="ritual-desc">{active.description}</p>
              </div>
              <button
                type="button"
                className="ritual-close"
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* ════════════════════════════════════════════════════════
           RITUALS SECTION
           ════════════════════════════════════════════════════════ */
        .rituals-section {
          background: var(--color-surface, #2D1B2E);
          overflow: hidden;          /* clip the outer cards at screen edges */
          padding: 80px 0 100px;
        }

        /* ── Arc container ──────────────────────────────────────
           The stage is a fixed-height area. Cards are absolutely
           positioned from its centre, offset by per-card CSS vars.
           Outer cards will be clipped by the section overflow.    */
        .arc-container {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-bottom: 40px;
        }

        .arc-stage {
          position: relative;
          width: 100%;
          max-width: 1400px;
          height: 460px;
        }

        /* ── Individual card ────────────────────────────────────
           Placed from the horizontal centre of .arc-stage.
           x/y/r come from per-card CSS custom properties.       */
        .rcard {
          position: absolute;
          left: 50%;
          top: 0;
          width: 240px;
          height: 340px;
          border-radius: 14px;
          overflow: hidden;
          background: #1a0a12;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          padding: 0;
          border: 0;
          font: inherit;
          color: inherit;
          appearance: none;
          transform:
            translateX(calc(-50% + var(--card-x)))
            translateY(var(--card-y))
            rotate(var(--card-r));
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .rcard:hover {
          transform:
            translateX(calc(-50% + var(--card-x)))
            translateY(calc(var(--card-y) - 12px))
            rotate(var(--card-r))
            scale(1.06);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        .rcard:focus-visible {
          outline: 2px solid var(--color-ink);
          outline-offset: 4px;
        }

        .rcard img {
          width: 100%;
          height: calc(100% - 44px);
          object-fit: cover;
          display: block;
        }

        .rcard-label {
          display: block;
          height: 44px;
          line-height: 44px;
          background: #1a0a12;
          color: #f5ebe0;
          text-align: center;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── Text block ─────────────────────────────────────── */
        .rituals-copy {
          padding: 24px 80px 0;
        }

        .rituals-tag {
          font-family: 'Space Mono', 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--color-ink) 50%, transparent);
          margin: 0 0 24px;
        }

        .rituals-headline {
          font-family: var(--font-display);
          font-size: clamp(52px, 8vw, 130px);
          font-weight: 800;
          color: var(--color-ink);
          text-transform: uppercase;
          line-height: 0.92;
          letter-spacing: -0.02em;
          margin: 0 0 24px;
        }

        .rituals-body {
          font-family: 'Space Mono', 'IBM Plex Mono', monospace;
          font-size: 15px;
          color: color-mix(in srgb, var(--color-ink) 65%, transparent);
          max-width: 480px;
          line-height: 1.65;
          margin: 0 0 28px;
        }

        .rituals-cta {
          display: inline-block;
          font-family: 'Space Mono', 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--color-ink) 75%, transparent);
          text-decoration: none;
          border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 35%, transparent);
          padding-bottom: 3px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .rituals-cta:hover {
          color: var(--color-ink);
          border-color: var(--color-ink);
        }

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 1200px) {
          .rcard {
            width: 200px;
            height: 280px;
          }
          .arc-stage { height: 400px; }
        }

        @media (max-width: 768px) {
          .rituals-section { padding: 60px 0 80px; }
          .rituals-copy { padding: 24px 24px 0; }
          .rcard {
            width: 160px;
            height: 230px;
          }
          .rcard-label {
            height: 36px;
            line-height: 36px;
            font-size: 9px;
          }
          .rcard img { height: calc(100% - 36px); }
          .arc-stage { height: 340px; }
        }

        /* ── Lightbox ───────────────────────────────────────── */
        .ritual-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(10, 5, 10, 0.88);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          cursor: zoom-out;
        }

        .ritual-modal {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          max-width: 600px;
          width: 100%;
          cursor: default;
        }

        .ritual-image {
          width: 100%;
          max-height: 75vh;
          object-fit: cover;
          border-radius: 16px;
          display: block;
        }

        .ritual-meta { text-align: center; padding: 0 8px; }

        .ritual-title {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: clamp(26px, 4vw, 40px);
          letter-spacing: -0.01em;
          line-height: 1.05;
          color: #f5ebe0;
          margin: 0 0 10px;
          text-transform: uppercase;
        }

        .ritual-desc {
          font-family: 'Space Mono', 'IBM Plex Mono', monospace;
          font-size: 14px;
          color: rgba(245, 235, 224, 0.6);
          margin: 0;
        }

        .ritual-close {
          position: absolute;
          top: -14px;
          right: -14px;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(245, 235, 224, 0.25);
          background: rgba(26, 10, 18, 0.85);
          color: #f5ebe0;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .ritual-close:hover {
          background: rgba(26, 10, 18, 1);
          border-color: rgba(245, 235, 224, 0.55);
        }
      `}</style>
    </section>
  );
}