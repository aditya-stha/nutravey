"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@shopify/hydrogen-react";
import { products, curation } from "@/lib/products";
import { isPreLaunch, isShopifyConfigured } from "@/lib/shopify-config";
import { track } from "@/lib/analytics";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface CurationDetailProps {
  /** The three flavour variant GIDs — the bundle is a composite: adding it
   *  puts one of each in the cart. Empty when any flavour is offline. */
  variantIds?: string[];
  available?: boolean;
}

export default function CurationDetail({
  variantIds = [],
  available = false,
}: CurationDetailProps) {
  const reduce = useReducedMotion();
  const [qty, setQty] = useState(1);

  const { linesAdd, status, checkoutUrl } = useCart();
  const cartBusy = status === "creating" || status === "updating";
  // Cart mutations need the public token even when product data is tokenless.
  const purchasable =
    variantIds.length === 3 && available && isShopifyConfigured;

  function addToCart(): boolean {
    if (!purchasable || cartBusy) return false;
    // One of each flavour per bundle; the qty selector multiplies the set.
    linesAdd(variantIds.map((id) => ({ merchandiseId: id, quantity: qty })));
    track("add_to_cart", {
      item_id: curation.slug,
      item_name: curation.name,
      quantity: qty,
      price: curation.bundlePrice,
      currency: "USD",
    });
    return true;
  }

  function buyNow() {
    if (!addToCart()) return;
    track("begin_checkout", { item_id: curation.slug, source: "buy_now" });
    window.location.href = checkoutUrl ?? "/cart";
  }

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
          <clipPath id="curation-squircle" clipPathUnits="objectBoundingBox">
            <path d="M 0.05,0 L 0.95,0 C 0.978,0 1,0.022 1,0.05 L 1,0.95 C 1,0.978 0.978,1 0.95,1 L 0.05,1 C 0.022,1 0,0.978 0,0.95 L 0,0.05 C 0,0.022 0.022,0 0.05,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="cur-hero"
        style={{
          backgroundColor: "var(--color-surface)",
          overflow: "clip",
        }}
      >
        <div className="content-rail cur-hero-rail">
          {/* Left — stacked composition of all three products */}
          <motion.div
            className="cur-stage canvas-hover"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {products.map((p, i) => (
              <div
                key={p.id}
                className="cur-tile"
                data-pos={p.position}
                style={
                  { "--flavor": p.accent, "--i": i } as CSSProperties
                }
              >
                <div className="canvas-glow" aria-hidden="true" />
                <div className="cur-tile-squircle">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 900px) 30vw, 220px"
                    priority={i === 1}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Right — meta block */}
          <motion.div
            className="cur-meta"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <p
              className="mono-label"
              style={{
                color: "var(--color-ink)",
                opacity: 0.55,
                marginBottom: "20px",
              }}
            >
              The Curation · All Three Rituals
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
              {curation.name}.
            </h1>

            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(22px, 2.4vw, 28px)",
                letterSpacing: "-0.005em",
                lineHeight: 1.3,
                color: "var(--color-ink)",
                opacity: 0.7,
                marginBottom: "24px",
              }}
            >
              {curation.tagline}
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
              {curation.description}
            </p>

            <hr style={{ margin: "0 0 28px" }} />

            <div className="cur-price-row">
              <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "32px",
                    letterSpacing: "-0.01em",
                    color: "var(--color-ink)",
                  }}
                >
                  {curation.bundlePriceLabel}
                </span>
                <span
                  className="mono-body"
                  style={{
                    color: "var(--color-ink-faint)",
                    fontSize: "14px",
                    textDecoration: "line-through",
                  }}
                >
                  {curation.listPriceLabel}
                </span>
              </div>
              <span
                className="mono-label"
                style={{ color: "var(--color-strawberry)" }}
              >
                {curation.savingsLabel}
              </span>
            </div>

            {/* Qty selector */}
            <div className="cur-qty-row">
              <span
                className="mono-label"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Quantity
              </span>
              <div className="cur-qty">
                <button
                  type="button"
                  className="cur-qty-btn mono-cta"
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
                  className="cur-qty-btn mono-cta"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(9, q + 1))}
                  disabled={qty >= 9}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs — primary uses oxblood (neutral brand) for the bundle.
                Pre-launch: route to the reservation exhibition with the
                bundle preselected. Live: real Storefront cart mutations. */}
            {isPreLaunch ? (
              <div className="cur-cta-row">
                <Link
                  href="/shop?item=bundle"
                  className="cur-cta-primary mono-cta"
                  style={{ backgroundColor: "var(--color-oxblood)" }}
                >
                  Reserve the Curation →
                </Link>
              </div>
            ) : (
              <>
                <div className="cur-cta-row">
                  <button
                    type="button"
                    className="cur-cta-primary mono-cta"
                    style={{ backgroundColor: "var(--color-oxblood)" }}
                    onClick={addToCart}
                    disabled={!purchasable || cartBusy}
                  >
                    {cartBusy ? "Adding…" : "Add Curation to Cart"}
                  </button>
                  <button
                    type="button"
                    className="cur-cta-secondary mono-cta"
                    onClick={buyNow}
                    disabled={!purchasable || cartBusy}
                  >
                    Buy Now →
                  </button>
                </div>
                {purchasable && (
                  <p
                    className="mono-body"
                    style={{
                      fontSize: "12px",
                      color: "var(--color-ink-faint)",
                      marginTop: "12px",
                    }}
                  >
                    Adds all three rituals to your cart — the {curation.savingsLabel.toLowerCase()} bundle
                    saving is applied automatically at checkout.
                  </p>
                )}
                {!purchasable && (
                  <p
                    className="mono-body"
                    style={{
                      fontSize: "12px",
                      color: "var(--color-ink-faint)",
                      marginTop: "12px",
                    }}
                  >
                    {variantIds.length !== 3
                      ? "The bundle connects once all three flavours are live on the storefront."
                      : !isShopifyConfigured
                        ? "Live pricing connected — add the Storefront token to open the cart."
                        : "Currently unavailable."}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>
        <hr style={{ marginTop: "96px" }} />
      </section>

      {/* ── What's inside — three flavor cards ─────────────────────── */}
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
            What’s Inside
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
            Three rituals. One box.
          </h2>

          <div className="cur-flavor-grid">
            {products.map((p) => (
              <article
                key={p.id}
                className="cur-flavor-card"
                style={{ "--flavor": p.accent } as CSSProperties}
              >
                <Link
                  href={`/products/${p.slug}`}
                  className="cur-flavor-visual"
                  aria-label={`View ${p.name}`}
                >
                  <div className="cur-flavor-glow" aria-hidden="true" />
                  <div className="cur-flavor-squircle">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 90vw, 30vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </Link>

                <p
                  className="mono-label"
                  style={{ color: p.accent, marginBottom: "8px" }}
                >
                  {p.flavour} · {p.servings} Sachets
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: "22px",
                    letterSpacing: "-0.01em",
                    color: "var(--color-ink)",
                    margin: "0 0 6px",
                  }}
                >
                  {p.name}
                </h3>
                <p
                  className="mono-body"
                  style={{
                    fontSize: "13px",
                    color: "var(--color-ink-faint)",
                    marginBottom: "18px",
                  }}
                >
                  {p.tagline}
                </p>

                <ul
                  style={{
                    listStyle: "none",
                    margin: "0 0 20px",
                    padding: 0,
                    borderTop: "0.4px solid var(--color-rule)",
                  }}
                >
                  {p.benefits.map((b) => (
                    <li
                      key={b.label}
                      className="mono-body"
                      style={{
                        padding: "10px 0",
                        borderBottom: "0.4px solid var(--color-rule)",
                        fontSize: "12px",
                        color: "var(--color-ink)",
                        opacity: 0.85,
                      }}
                    >
                      {b.label}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/products/${p.slug}`}
                  className="cur-flavor-link mono-cta"
                >
                  View Product →
                </Link>
              </article>
            ))}
          </div>
        </div>
        <hr />
      </section>

      {/* ── Why bundle ───────────────────────────────────────────── */}
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
            Why the Curation
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(32px, 4vw, 48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: "var(--color-ink)",
              maxWidth: "560px",
              marginBottom: "48px",
            }}
          >
            One box, three days, ninety mornings.
          </h2>

          <div className="cur-benefits">
            <div className="cur-benefit">
              <span
                className="mono-label"
                style={{
                  color: "var(--color-strawberry)",
                  marginBottom: "12px",
                }}
              >
                01 · Rotation
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
                A different botanical profile each day. Your body adapts to
                variety better than it adapts to repetition.
              </p>
            </div>
            <div className="cur-benefit">
              <span
                className="mono-label"
                style={{
                  color: "var(--color-lychee)",
                  marginBottom: "12px",
                }}
              >
                02 · Savings
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
                Three months of daily hydration for less than the cost of
                three sleeves bought separately. {curation.savingsLabel}.
              </p>
            </div>
            <div className="cur-benefit">
              <span
                className="mono-label"
                style={{
                  color: "var(--color-lemon)",
                  marginBottom: "12px",
                }}
              >
                03 · Ritual
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
                Choose by the day, not the diagnosis — strawberry for vitality,
                lychee for composure, lemon for clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Hero ────────────────────────────────────────────────────── */
        .cur-hero-rail {
          padding-top: 80px;
          padding-bottom: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
          align-items: center;
        }
        @media (min-width: 900px) {
          .cur-hero-rail {
            grid-template-columns: 1.05fr 1fr;
            gap: 72px;
            padding-top: 112px;
            min-height: 78vh;
          }
        }

        /* ── Three-tile stage ──────────────────────────────────────── */
        .cur-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 5 / 4;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 900px) {
          .cur-stage { margin: 0; }
        }

        .cur-tile {
          position: absolute;
          width: clamp(96px, 24vw, 160px);
          aspect-ratio: 4 / 5;
        }
        @media (min-width: 768px) {
          .cur-tile { width: clamp(140px, 28%, 220px); }
        }
        .cur-tile[data-pos="left"] {
          left: 4%;
          top: 22%;
          transform: rotate(-7deg);
          z-index: 2;
        }
        .cur-tile[data-pos="center"] {
          left: 50%;
          top: 6%;
          transform: translateX(-50%);
          z-index: 3;
          width: clamp(110px, 28vw, 190px);
        }
        @media (min-width: 768px) {
          .cur-tile[data-pos="center"] { width: clamp(160px, 32%, 250px); }
        }
        .cur-tile[data-pos="right"] {
          right: 4%;
          top: 26%;
          transform: rotate(7deg);
          z-index: 1;
        }

        .cur-tile-squircle {
          position: relative;
          width: 100%;
          height: 100%;
          clip-path: url(#curation-squircle);
          overflow: hidden;
        }

        /* ── Meta ───────────────────────────────────────────────────── */
        .cur-meta { display: flex; flex-direction: column; }

        .cur-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .cur-qty-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 0.4px solid var(--color-rule);
        }
        .cur-qty { display: inline-flex; align-items: center; gap: 14px; }
        .cur-qty-btn {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: var(--color-ink);
          border: 0.4px solid var(--color-rule);
          border-radius: var(--radius-canvas);
          padding: 0;
          cursor: pointer;
          font-size: 16px;
          transition: opacity 200ms ease, background-color 200ms ease;
        }
        .cur-qty-btn:hover:not(:disabled) {
          background-color: color-mix(in srgb, var(--color-ink) 6%, transparent);
        }
        .cur-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .cur-cta-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 540px) {
          .cur-cta-row { flex-direction: row; align-items: center; }
        }
        .cur-cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 28px;
          color: #FAFAFA;
          border-radius: var(--radius-canvas);
          flex: 1;
          letter-spacing: 0.08em;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .cur-cta-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .cur-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 24px;
          color: var(--color-ink);
          border-radius: var(--radius-canvas);
          background: transparent;
          flex-shrink: 0;
          transition: opacity 200ms ease;
        }
        /* CTAs render as <button> when the store is live */
        .cur-cta-primary, .cur-cta-secondary { border: none; cursor: pointer; }
        .cur-cta-primary:disabled, .cur-cta-secondary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .cur-cta-secondary:hover { opacity: 0.6; }

        /* ── Three flavor cards ─────────────────────────────────────── */
        .cur-flavor-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }
        @media (min-width: 768px) {
          .cur-flavor-grid { grid-template-columns: repeat(3, 1fr); gap: 40px; }
        }

        .cur-flavor-card {
          display: flex;
          flex-direction: column;
          max-width: 360px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }

        .cur-flavor-visual {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 4 / 5;
          margin-bottom: 20px;
        }
        .cur-flavor-glow {
          position: absolute;
          inset: -8%;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            var(--flavor) 0%,
            transparent 68%
          );
          filter: blur(56px);
          opacity: 0.7;
          transition: opacity 400ms ease, transform 400ms ease;
          pointer-events: none;
        }
        .cur-flavor-visual:hover .cur-flavor-glow {
          opacity: 1;
          transform: scale(1.12);
        }
        .cur-flavor-squircle {
          position: relative;
          width: 100%;
          height: 100%;
          clip-path: url(#curation-squircle);
          overflow: hidden;
        }

        .cur-flavor-link {
          color: var(--color-ink);
          opacity: 0.65;
          padding-bottom: 4px;
          border-bottom: 0.4px solid var(--color-rule);
          align-self: flex-start;
          transition: opacity 200ms ease;
        }
        .cur-flavor-link:hover { opacity: 1; }

        /* ── Why bundle ─────────────────────────────────────────────── */
        .cur-benefits {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 768px) {
          .cur-benefits { grid-template-columns: repeat(3, 1fr); gap: 48px; }
        }
        .cur-benefit {
          display: flex;
          flex-direction: column;
          padding-top: 24px;
          border-top: 0.4px solid var(--color-rule);
          max-width: 360px;
        }
      `}</style>
    </>
  );
}
