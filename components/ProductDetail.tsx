"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Product } from "@/lib/products";
import { products } from "@/lib/products";
import IngredientGrid from "@/components/IngredientGrid";

interface ProductDetailProps {
  product: Product;
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function ProductDetail({ product }: ProductDetailProps) {
  const reduce = useReducedMotion();
  const [qty, setQty] = useState(1);

  /* Sibling products for the "also explore" row at the bottom. */
  const siblings = products.filter((p) => p.slug !== product.slug);

  return (
    <>
      {/* Shared squircle clip path */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <clipPath id="pdp-squircle" clipPathUnits="objectBoundingBox">
            <path d="M 0.05,0 L 0.95,0 C 0.978,0 1,0.022 1,0.05 L 1,0.95 C 1,0.978 0.978,1 0.95,1 L 0.05,1 C 0.022,1 0,0.978 0,0.95 L 0,0.05 C 0,0.022 0.022,0 0.05,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── Above-the-fold hero ─────────────────────────────────────────── */}
      <section
        className="pdp-hero"
        style={
          {
            "--flavor": product.accent,
            backgroundColor: "var(--color-surface)",
          } as CSSProperties
        }
      >
        <div className="content-rail pdp-hero-rail">
          {/* Left — large product image with radial glow */}
          <motion.div
            className="pdp-visual"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="pdp-glow" aria-hidden="true" />
            <div className="pdp-squircle">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 900px) 90vw, 44vw"
                priority
                style={{ objectFit: "cover" }}
              />
            </div>
          </motion.div>

          {/* Right — flavour, name, tagline, price, qty, CTAs */}
          <motion.div
            className="pdp-meta"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          >
            <p
              className="mono-label"
              style={{ color: product.accent, marginBottom: "20px" }}
            >
              {product.flavour} · {product.servings} Sachets
            </p>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "clamp(48px, 6.5vw, 84px)",
                letterSpacing: "-0.025em",
                lineHeight: 0.98,
                color: "var(--color-ink)",
                marginBottom: "16px",
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(22px, 2.4vw, 28px)",
                letterSpacing: "-0.005em",
                lineHeight: 1.3,
                color: product.accent,
                marginBottom: "24px",
              }}
            >
              {product.tagline}
            </p>

            <p
              className="mono-body"
              style={{
                maxWidth: "440px",
                fontSize: "15px",
                lineHeight: 1.65,
                color: "var(--color-ink-muted)",
                marginBottom: "32px",
              }}
            >
              {product.description}
            </p>

            <hr style={{ margin: "0 0 28px" }} />

            <div className="pdp-price-row">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "32px",
                  letterSpacing: "-0.01em",
                  color: "var(--color-ink)",
                }}
              >
                {product.priceLabel}
              </span>
              <span
                className="mono-label"
                style={{ color: "var(--color-ink-faint)" }}
              >
                One Month · {product.servings} Days
              </span>
            </div>

            {/* Qty selector */}
            <div className="pdp-qty-row">
              <span
                className="mono-label"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Quantity
              </span>
              <div className="pdp-qty">
                <button
                  type="button"
                  className="pdp-qty-btn mono-cta"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <span
                  className="mono-cta"
                  style={{ minWidth: "32px", textAlign: "center" }}
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  className="pdp-qty-btn mono-cta"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(9, q + 1))}
                  disabled={qty >= 9}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs: solid color block + outlined */}
            <div className="pdp-cta-row">
              <Link
                href="/cart"
                className="pdp-cta-primary mono-cta"
                style={{ backgroundColor: product.accent }}
              >
                Add to Cart
              </Link>
              <Link href="/cart" className="pdp-cta-secondary mono-cta">
                Buy Now →
              </Link>
            </div>
          </motion.div>
        </div>
        <hr style={{ marginTop: "96px" }} />
      </section>

      {/* ── Active Formulation ingredient grid ──────────────────────── */}
      <IngredientGrid />

      {/* ── Benefits ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{
            paddingTop: "clamp(56px, 9vw, 96px)",
            paddingBottom: "clamp(40px, 5vw, 64px)",
          }}
        >
          <p
            className="mono-label"
            style={{
              color: "var(--color-ink)",
              opacity: 0.5,
              marginBottom: "16px",
            }}
          >
            What it does
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
              marginBottom: "48px",
            }}
          >
            Three benefits, in one sachet.
          </h2>

          <div className="pdp-benefits">
            {product.benefits.map((b, i) => (
              <div key={b.label} className="pdp-benefit">
                <span
                  className="mono-label"
                  style={{ color: product.accent, marginBottom: "12px" }}
                >
                  0{i + 1} · {b.label}
                </span>
                <p
                  className="mono-body"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "var(--color-ink)",
                    opacity: 0.85,
                  }}
                >
                  {b.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
        <hr />
      </section>

      {/* ── Ingredients + Usage ──────────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail pdp-two-col"
          style={{
            paddingTop: "clamp(56px, 9vw, 96px)",
            paddingBottom: "clamp(56px, 9vw, 96px)",
          }}
        >
          <div>
            <p
              className="mono-label"
              style={{
                color: "var(--color-ink)",
                opacity: 0.5,
                marginBottom: "16px",
              }}
            >
              Ingredients
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "32px",
                letterSpacing: "-0.015em",
                color: "var(--color-ink)",
                marginBottom: "28px",
              }}
            >
              Considered. Nothing else.
            </h3>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                borderTop: "0.4px solid var(--color-rule)",
              }}
            >
              {product.ingredients.map((ing) => (
                <li
                  key={ing}
                  className="mono-body"
                  style={{
                    padding: "14px 0",
                    borderBottom: "0.4px solid var(--color-rule)",
                    fontSize: "14px",
                    color: "var(--color-ink)",
                  }}
                >
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="mono-label"
              style={{
                color: "var(--color-ink)",
                opacity: 0.5,
                marginBottom: "16px",
              }}
            >
              Usage
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "32px",
                letterSpacing: "-0.015em",
                color: "var(--color-ink)",
                marginBottom: "28px",
              }}
            >
              One sachet, one moment.
            </h3>
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                borderTop: "0.4px solid var(--color-rule)",
              }}
            >
              {product.usage.map((step, i) => (
                <li
                  key={step}
                  style={{
                    display: "flex",
                    gap: "16px",
                    padding: "16px 0",
                    borderBottom: "0.4px solid var(--color-rule)",
                  }}
                >
                  <span
                    className="mono-label"
                    style={{
                      color: product.accent,
                      flexShrink: 0,
                      paddingTop: "2px",
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className="mono-body"
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.6,
                      color: "var(--color-ink)",
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <hr />
      </section>

      {/* ── Supplement facts ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{
            paddingTop: "clamp(56px, 9vw, 96px)",
            paddingBottom: "clamp(56px, 9vw, 96px)",
          }}
        >
          <p
            className="mono-label"
            style={{
              color: "var(--color-ink)",
              opacity: 0.5,
              marginBottom: "16px",
            }}
          >
            Supplement Facts
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(32px, 4vw, 48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: "var(--color-ink)",
              marginBottom: "40px",
            }}
          >
            Per sachet.
          </h2>

          <div className="pdp-facts">
            <div className="pdp-facts-head">
              <span className="mono-label" style={{ color: "var(--color-ink-muted)" }}>
                Nutrient
              </span>
              <span className="mono-label" style={{ color: "var(--color-ink-muted)" }}>
                Amount
              </span>
              <span
                className="mono-label"
                style={{ color: "var(--color-ink-muted)", textAlign: "right" }}
              >
                % DV
              </span>
            </div>
            {product.supplementFacts.map((row) => (
              <div key={row.label} className="pdp-facts-row">
                <span
                  className="mono-body"
                  style={{ fontSize: "14px", color: "var(--color-ink)" }}
                >
                  {row.label}
                </span>
                <span
                  className="mono-body"
                  style={{ fontSize: "14px", color: "var(--color-ink)" }}
                >
                  {row.amount}
                </span>
                <span
                  className="mono-body"
                  style={{
                    fontSize: "14px",
                    color: "var(--color-ink-muted)",
                    textAlign: "right",
                  }}
                >
                  {row.dv ?? "—"}
                </span>
              </div>
            ))}
          </div>

          <p
            className="mono-body"
            style={{
              fontSize: "11px",
              lineHeight: 1.6,
              color: "var(--color-ink-faint)",
              marginTop: "24px",
              maxWidth: "560px",
            }}
          >
            % Daily Value (DV) based on a 2,000 calorie diet. Not evaluated by
            the FDA. Not intended to diagnose, treat, cure, or prevent any
            disease.
          </p>
        </div>
        <hr />
      </section>

      {/* ── Cross-sell: also explore ─────────────────────────────────── */}
      <section style={{ backgroundColor: "var(--color-surface)" }}>
        <div
          className="content-rail"
          style={{
            paddingTop: "clamp(56px, 9vw, 96px)",
            paddingBottom: "clamp(72px, 10vw, 120px)",
          }}
        >
          <p
            className="mono-label"
            style={{
              color: "var(--color-ink)",
              opacity: 0.5,
              marginBottom: "16px",
            }}
          >
            Also Explore
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(32px, 4vw, 48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: "var(--color-ink)",
              marginBottom: "48px",
              maxWidth: "560px",
            }}
          >
            The other two rituals.
          </h2>

          <div className="pdp-related">
            {siblings.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="pdp-related-card"
                style={{ "--flavor": p.accent } as CSSProperties}
              >
                <div className="pdp-related-visual">
                  <div className="pdp-related-glow" aria-hidden="true" />
                  <div className="pdp-related-squircle">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 45vw, 260px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
                <p
                  className="mono-label"
                  style={{
                    color: "var(--color-ink)",
                    opacity: 0.55,
                    marginBottom: "4px",
                  }}
                >
                  {p.flavour}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "20px",
                    letterSpacing: "-0.01em",
                    color: "var(--color-ink)",
                    margin: "0 0 4px",
                  }}
                >
                  {p.name}
                </h3>
                <p
                  className="mono-body"
                  style={{
                    fontSize: "12px",
                    color: "var(--color-ink-faint)",
                  }}
                >
                  {p.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* Contain the radial glow — at -14% inset on a phone-width image
           the bloom would otherwise push the body past 100vw and cause
           horizontal scroll. overflow: clip avoids that without
           introducing a scroll container. */
        .pdp-hero { overflow: clip; }

        /* ── Hero rail (two-col) ───────────────────────────────────────── */
        .pdp-hero-rail {
          padding-top: 64px;
          padding-bottom: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: center;
        }
        @media (min-width: 900px) {
          .pdp-hero-rail {
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            padding-top: 112px;
            min-height: 78vh;
          }
        }

        .pdp-visual {
          position: relative;
          width: 100%;
          max-width: 520px;
          aspect-ratio: 4 / 5;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 900px) {
          .pdp-visual { margin: 0; }
        }

        .pdp-glow {
          position: absolute;
          inset: -14%;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            var(--flavor) 0%,
            var(--flavor) 18%,
            transparent 68%
          );
          filter: blur(80px);
          opacity: 1;
          pointer-events: none;
        }

        .pdp-squircle {
          position: relative;
          width: 100%;
          height: 100%;
          clip-path: url(#pdp-squircle);
          overflow: hidden;
        }

        /* ── Meta column ───────────────────────────────────────────────── */
        .pdp-meta {
          display: flex;
          flex-direction: column;
        }

        .pdp-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .pdp-qty-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 0.4px solid var(--color-rule);
        }

        .pdp-qty {
          display: inline-flex;
          align-items: center;
          gap: 14px;
        }
        .pdp-qty-btn {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: var(--color-ink);
          border: 0.4px solid var(--color-rule);
          border-radius: 0;
          padding: 0;
          cursor: pointer;
          font-size: 16px;
          transition: opacity 200ms ease, background-color 200ms ease;
        }
        .pdp-qty-btn:hover:not(:disabled) {
          background-color: color-mix(in srgb, var(--color-ink) 6%, transparent);
        }
        .pdp-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* ── CTAs (brand rule: solid block 0 radius OR thin text link) ── */
        .pdp-cta-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 540px) {
          .pdp-cta-row { flex-direction: row; align-items: center; }
        }

        .pdp-cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 28px;
          color: #FAFAFA;
          border-radius: 0;
          flex: 1;
          letter-spacing: 0.08em;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .pdp-cta-primary:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .pdp-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 24px;
          color: var(--color-ink);
          border-radius: 0;
          background: transparent;
          flex-shrink: 0;
          transition: opacity 200ms ease;
        }
        .pdp-cta-secondary:hover { opacity: 0.6; }

        /* ── Benefits ──────────────────────────────────────────────────── */
        .pdp-benefits {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .pdp-benefits { grid-template-columns: repeat(3, 1fr); gap: 48px; }
        }
        .pdp-benefit {
          display: flex;
          flex-direction: column;
          padding-top: 24px;
          border-top: 0.4px solid var(--color-rule);
          max-width: 360px;
        }

        /* ── Two-column (ingredients + usage) ──────────────────────────── */
        .pdp-two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
        }
        @media (min-width: 768px) {
          .pdp-two-col {
            grid-template-columns: 1fr 1fr;
            gap: 96px;
            align-items: start;
          }
        }

        /* ── Supplement facts table ───────────────────────────────────── */
        .pdp-facts {
          border-top: 0.4px solid var(--color-rule);
          max-width: 720px;
        }
        .pdp-facts-head,
        .pdp-facts-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 0.4px solid var(--color-rule);
        }
        .pdp-facts-head {
          padding-top: 16px;
          padding-bottom: 16px;
        }

        /* ── Related ──────────────────────────────────────────────────── */
        .pdp-related {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .pdp-related { gap: 48px; max-width: 720px; }
        }

        .pdp-related-card {
          display: block;
          transition: opacity 200ms ease;
        }
        .pdp-related-card:hover { opacity: 0.85; }

        .pdp-related-visual {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          margin-bottom: 16px;
        }
        .pdp-related-glow {
          position: absolute;
          inset: -8%;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            var(--flavor) 0%,
            transparent 65%
          );
          filter: blur(48px);
          opacity: 0;
          transition: opacity 400ms ease;
          pointer-events: none;
        }
        .pdp-related-card:hover .pdp-related-glow { opacity: 0.7; }

        .pdp-related-squircle {
          position: relative;
          width: 100%;
          height: 100%;
          clip-path: url(#pdp-squircle);
          overflow: hidden;
        }

      `}</style>
    </>
  );
}
