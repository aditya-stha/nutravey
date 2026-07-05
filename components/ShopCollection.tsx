"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { products, curation } from "@/lib/products";

/* ─── Entry animation ───────────────────────────────────────────────────
   Brand rule: fade-up, 600ms, 50ms stagger. */
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export default function ShopCollection() {
  const reduce = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      {/* ── Squircle clip shared by every card ─────────────────────────── */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <clipPath id="shop-card-squircle" clipPathUnits="objectBoundingBox">
            <path d="M 0.05,0 L 0.95,0 C 0.978,0 1,0.022 1,0.05 L 1,0.95 C 1,0.978 0.978,1 0.95,1 L 0.05,1 C 0.022,1 0,0.978 0,0.95 L 0,0.05 C 0,0.022 0.022,0 0.05,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── Hero strip ─────────────────────────────────────────────────── */}
      <section
        className="shop-hero"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div
          className="content-rail"
          style={{
            paddingTop: "clamp(64px, 9vw, 96px)",
            paddingBottom: "32px",
          }}
        >
          <motion.p
            className="mono-label"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ color: "var(--color-ink)", marginBottom: "20px" }}
          >
            The Collection · 30 Sachets Each
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(56px, 9vw, 112px)",
              letterSpacing: "-0.025em",
              lineHeight: 0.96,
              color: "var(--color-ink)",
              marginBottom: "28px",
              maxWidth: "880px",
            }}
          >
            The Collection.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
            style={{
              maxWidth: "520px",
              fontSize: "17px",
              lineHeight: 1.6,
              color: "var(--color-ink-muted)",
              marginBottom: "0",
            }}
          >
            Three flavours. Three rituals. Each formulated with full-spectrum
            electrolytes, considered botanicals, and a clean vitamin profile —
            so you can pick by the day, not the diagnosis.
          </motion.p>
        </div>

        <hr style={{ marginTop: "64px" }} />
      </section>

      {/* ── Product grid ───────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{
            paddingTop: "clamp(48px, 6vw, 72px)",
            paddingBottom: "32px",
          }}
        >
          <motion.div
            className="shop-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {products.map((product) => {
              const isHovered = hoveredId === product.id;
              return (
                <motion.article
                  key={product.id}
                  variants={itemVariants}
                  className="shop-card"
                  data-self-hovered={isHovered ? "true" : undefined}
                  style={{ "--flavor": product.accent } as CSSProperties}
                  onHoverStart={() => setHoveredId(product.id)}
                  onHoverEnd={() => setHoveredId(null)}
                >
                  {/* Visual: glow sibling + clipped squircle frame */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="shop-card-visual"
                    aria-label={`View ${product.name}`}
                  >
                    <div className="shop-glow" aria-hidden="true" />
                    <div className="shop-squircle">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 90vw, 32vw"
                        className="shop-squircle-image"
                      />
                    </div>
                  </Link>

                  {/* Meta block */}
                  <div className="shop-meta">
                    <p
                      className="mono-label"
                      style={{
                        color: "var(--color-ink)",
                        opacity: 0.55,
                        marginBottom: "8px",
                      }}
                    >
                      {product.flavour} · {product.servings} Sachets
                    </p>

                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 500,
                        fontSize: "26px",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.05,
                        color: "var(--color-ink)",
                        margin: "0 0 6px",
                      }}
                    >
                      {product.name}
                    </h2>

                    <p
                      className="mono-body"
                      style={{
                        fontSize: "13px",
                        color: "var(--color-ink-faint)",
                        marginBottom: "20px",
                      }}
                    >
                      {product.tagline}
                    </p>

                    {/* Price + view link row */}
                    <div className="shop-price-row">
                      <span
                        className="mono-cta"
                        style={{ color: "var(--color-ink)", fontSize: "15px" }}
                      >
                        {product.priceLabel}
                      </span>
                      <Link
                        href={`/products/${product.slug}`}
                        className="shop-view-link mono-cta"
                      >
                        View Product →
                      </Link>
                    </div>

                    {/* Add to cart — solid color block, 0 radius (brand rule) */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="shop-add-button mono-cta"
                      style={{ backgroundColor: product.accent }}
                    >
                      Add to Cart
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── The Curation — bundle promo ──────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <hr />
        <div
          className="content-rail"
          style={{
            paddingTop: "clamp(56px, 9vw, 96px)",
            paddingBottom: "clamp(72px, 10vw, 120px)",
          }}
        >
          <motion.div
            className="shop-curation"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="shop-curation-meta">
              <p
                className="mono-label"
                style={{
                  color: "var(--color-ink)",
                  opacity: 0.5,
                  marginBottom: "16px",
                }}
              >
                The Curation · All Three
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(40px, 5.5vw, 64px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 0.98,
                  color: "var(--color-ink)",
                  marginBottom: "20px",
                  maxWidth: "520px",
                }}
              >
                {curation.tagline}
              </h2>
              <p
                className="mono-body"
                style={{
                  maxWidth: "480px",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "var(--color-ink-muted)",
                  marginBottom: "32px",
                }}
              >
                {curation.description}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "16px",
                  marginBottom: "28px",
                }}
              >
                <span
                  className="mono-cta"
                  style={{
                    color: "var(--color-ink)",
                    fontSize: "20px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {curation.bundlePriceLabel}
                </span>
                <span
                  className="mono-body"
                  style={{
                    color: "var(--color-ink-faint)",
                    fontSize: "13px",
                    textDecoration: "line-through",
                  }}
                >
                  {curation.listPriceLabel}
                </span>
                <span
                  className="mono-label"
                  style={{
                    color: "var(--color-strawberry)",
                    fontSize: "10px",
                  }}
                >
                  {curation.savingsLabel}
                </span>
              </div>
              <Link
                href="/products/the-curation"
                className="shop-curation-cta mono-cta"
              >
                Explore the Curation →
              </Link>
            </div>

            {/* Mini-stack of the three product mocks */}
            <div className="shop-curation-stack" aria-hidden="true">
              {products.map((p, i) => (
                <div
                  key={p.id}
                  className="shop-curation-tile"
                  style={
                    {
                      "--flavor": p.accent,
                      "--i": i,
                    } as CSSProperties
                  }
                >
                  <div className="shop-curation-glow" />
                  <div className="shop-curation-squircle">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="220px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        /* ── Hero ─────────────────────────────────────────────────────── */
        .shop-hero { padding-bottom: 0; }

        /* ── Grid ─────────────────────────────────────────────────────── */
        .shop-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
        }
        @media (min-width: 768px) {
          .shop-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            align-items: start;
          }
        }

        .shop-card {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 360px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ── Card visual ─────────────────────────────────────────────── */
        .shop-card-visual {
          position: relative;
          display: block;
          width: 100%;
          margin-bottom: 24px;
        }

        .shop-glow {
          position: absolute;
          inset: -8%;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            var(--flavor) 0%,
            var(--flavor) 16%,
            transparent 68%
          );
          filter: blur(56px);
          opacity: 0;
          transform: scale(0.88);
          transition:
            opacity 600ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .shop-card[data-self-hovered="true"] .shop-glow,
        .shop-card-visual:hover .shop-glow {
          opacity: 0.95;
          transform: scale(1.25);
        }

        .shop-squircle {
          position: relative;
          aspect-ratio: 4 / 5;
          width: 100%;
          background: transparent;
          clip-path: url(#shop-card-squircle);
          overflow: hidden;
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .shop-card[data-self-hovered="true"] .shop-squircle,
        .shop-card-visual:hover .shop-squircle {
          transform: translateY(-6px);
        }
        .shop-squircle-image {
          object-fit: cover;
          object-position: center;
        }

        /* ── Card meta ───────────────────────────────────────────────── */
        .shop-meta {
          display: flex;
          flex-direction: column;
        }

        .shop-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 0.4px solid var(--color-rule);
        }

        .shop-view-link {
          color: var(--color-ink);
          opacity: 0.6;
          transition: opacity 200ms ease;
        }
        .shop-view-link:hover { opacity: 1; }

        /* Solid color block CTA — 0 radius per brand rule */
        .shop-add-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 16px 20px;
          color: #FAFAFA;
          border-radius: var(--radius-canvas);
          letter-spacing: 0.08em;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .shop-add-button:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }

        /* ── Curation row ──────────────────────────────────────────────
           Mobile: stacked (text on top, boxes below).
           Desktop: layered — text foreground at left, box cluster anchored
           to the right with a soft inward lean that bleeds left under
           the text. Boxes are absolute-pinned with safe inner margins so
           the rightmost can never overflow the rail. */
        .shop-curation {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        @media (min-width: 900px) {
          .shop-curation {
            display: block;
            min-height: 460px;
          }
        }

        .shop-curation-meta {
          position: relative;
          z-index: 2;
          max-width: 480px;
        }
        @media (min-width: 900px) {
          .shop-curation-meta {
            max-width: 520px;
            padding-top: 8px;
          }
        }

        .shop-curation-cta {
          display: inline-block;
          color: var(--color-ink);
          padding-bottom: 4px;
          border-bottom: 0.4px solid var(--color-rule);
          transition: opacity 200ms ease;
        }
        .shop-curation-cta:hover { opacity: 0.6; }

        .shop-curation-stack {
          position: relative;
          width: 100%;
          height: 320px;
          z-index: 1;
        }
        @media (min-width: 900px) {
          .shop-curation-stack {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            /* Take ~64% of the rail width and anchor right; this lets the
               left tile bleed under the text column without the right tile
               clipping past the rail. */
            width: 64%;
            height: 380px;
          }
        }

        .shop-curation-tile {
          position: absolute;
          top: 50%;
          width: clamp(118px, 26vw, 172px);
          aspect-ratio: 4 / 5;
          transform-origin: center;
        }
        @media (min-width: 900px) {
          .shop-curation-tile { width: clamp(140px, 23%, 175px); }
        }

        .shop-curation-tile:nth-child(1) {
          left: 6%;
          transform: translateY(-50%) rotate(-8deg);
          z-index: 1;
        }
        .shop-curation-tile:nth-child(2) {
          left: 50%;
          transform: translate(-50%, -56%) rotate(0deg);
          z-index: 3;
          width: clamp(128px, 30vw, 190px);
        }
        @media (min-width: 900px) {
          .shop-curation-tile:nth-child(2) { width: clamp(150px, 27%, 200px); }
        }
        .shop-curation-tile:nth-child(3) {
          left: auto;
          right: 6%;
          transform: translateY(-50%) rotate(8deg);
          z-index: 2;
        }

        .shop-curation-glow {
          position: absolute;
          inset: -14%;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            var(--flavor) 0%,
            transparent 65%
          );
          filter: blur(56px);
          opacity: 0.78;
          pointer-events: none;
        }
        .shop-curation-squircle {
          position: relative;
          width: 100%;
          height: 100%;
          clip-path: url(#shop-card-squircle);
          overflow: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .shop-glow,
          .shop-squircle,
          .shop-add-button { transition: none; }
          .shop-card-visual:hover .shop-squircle,
          .shop-card[data-self-hovered="true"] .shop-squircle {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
