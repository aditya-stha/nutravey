"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useCart } from "@shopify/hydrogen-react";
import type { Product } from "@/lib/products";
import { products } from "@/lib/products";
import IngredientGrid from "@/components/IngredientGrid";
import { isPreLaunch } from "@/lib/shopify-config";

interface ProductDetailProps {
  product: Product;
  /** Shopify variant GID (merchandiseId). Absent when Shopify isn't
   *  configured or the product has no published variant — add-to-cart is
   *  disabled and the static price from `lib/products.ts` is shown. */
  variantId?: string;
  /** Whether the variant is purchasable. Defaults to false when unknown. */
  available?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function ProductDetail({
  product,
  variantId,
  available = false,
}: ProductDetailProps) {
  const reduce = useReducedMotion();
  const [qty, setQty] = useState(1);

  // Pre-launch reservation state hooks
  const [pdpEmail, setPdpEmail] = useState("");
  const [pdpName, setPdpName] = useState("");
  const [pdpIsSubmitting, setPdpIsSubmitting] = useState(false);
  const [pdpTicket, setPdpTicket] = useState<{ id: string; name: string; email: string; flavor: string } | null>(null);
  const [pdpTilt, setPdpTilt] = useState({ x: 0, y: 0 });
  const [showPdpForm, setShowPdpForm] = useState(false);

  const handlePdpMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = (y / (box.height / 2)) * -12;
    const tiltY = (x / (box.width / 2)) * 12;
    setPdpTilt({ x: tiltX, y: tiltY });
  };

  const handlePdpReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdpEmail || !pdpName) return;
    setPdpIsSubmitting(true);
    setTimeout(() => {
      const serial = `NVY-${product.id.slice(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setPdpTicket({
        id: serial,
        name: pdpName,
        email: pdpEmail,
        flavor: product.name,
      });
      setPdpIsSubmitting(false);
    }, 1200);
  };

  const { linesAdd, status, checkoutUrl } = useCart();

  /* `creating`/`updating` mean a Storefront mutation is in flight. */
  const cartBusy = status === "creating" || status === "updating";
  const purchasable = Boolean(variantId) && available;

  /** Add the selected quantity to the Storefront cart. Returns true when the
   *  add was dispatched (used by Buy Now to then redirect to checkout). */
  function addToCart(): boolean {
    if (!variantId || !purchasable || cartBusy) return false;
    linesAdd([{ merchandiseId: variantId, quantity: qty }]);
    return true;
  }

  function buyNow() {
    if (!addToCart()) return;
    // `checkoutUrl` exists only once the cart has been created on the
    // Storefront. If it's ready, jump straight to Shopify checkout; otherwise
    // send the shopper to the cart page where the checkout link resolves.
    window.location.href = checkoutUrl ?? "/cart";
  }

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

            {isPreLaunch ? (
              <div style={{ marginTop: "24px" }}>
                <AnimatePresence mode="wait">
                  {!pdpTicket ? (
                    <motion.div
                      key="pdp-reserve-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-4"
                    >
                      {!showPdpForm ? (
                        <button
                          type="button"
                          className="pdp-cta-primary mono-cta w-full py-4 text-center cursor-pointer text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: product.accent }}
                          onClick={() => setShowPdpForm(true)}
                        >
                          Reserve Priority Allocation
                        </button>
                      ) : (
                        <motion.form
                          onSubmit={handlePdpReserve}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="border border-[var(--color-rule)] p-6 bg-[var(--color-surface-warm)] flex flex-col gap-4 overflow-hidden"
                        >
                          <p className="mono-body text-[12px] text-[var(--color-ink-muted)] mb-2">
                            Secure your position in the upcoming batch release of {product.name}. Zero payment due today.
                          </p>
                          <div>
                            <label htmlFor="pdp-name" className="mono-label text-[9px] block mb-1 opacity-60">Full Name</label>
                            <input
                              id="pdp-name"
                              type="text"
                              required
                              value={pdpName}
                              onChange={(e) => setPdpName(e.target.value)}
                              placeholder="Aditya Shrestha"
                              className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] px-3 py-2 font-mono text-[13px] focus:outline-none focus:border-[var(--color-ink)]"
                              style={{ borderRadius: 0 }}
                            />
                          </div>
                          <div>
                            <label htmlFor="pdp-email" className="mono-label text-[9px] block mb-1 opacity-60">Email Address</label>
                            <input
                              id="pdp-email"
                              type="email"
                              required
                              value={pdpEmail}
                              onChange={(e) => setPdpEmail(e.target.value)}
                              placeholder="aditya@example.com"
                              className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] px-3 py-2 font-mono text-[13px] focus:outline-none focus:border-[var(--color-ink)]"
                              style={{ borderRadius: 0 }}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={pdpIsSubmitting}
                            className="mono-cta w-full py-3 text-center text-white bg-[var(--color-ink)] hover:bg-transparent hover:text-[var(--color-ink)] border border-[var(--color-ink)] transition-all duration-300 disabled:opacity-50"
                            style={{ backgroundColor: product.accent, borderColor: product.accent }}
                          >
                            {pdpIsSubmitting ? "ALLOCATING..." : "CONFIRM FREE SLOT"}
                          </button>
                        </motion.form>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pdp-ticket"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center animate-fade-in"
                    >
                      <div
                        onMouseMove={handlePdpMouseMove}
                        onMouseLeave={() => setPdpTilt({ x: 0, y: 0 })}
                        style={{
                          transform: `perspective(1000px) rotateX(${pdpTilt.x}deg) rotateY(${pdpTilt.y}deg)`,
                          transition: reduce ? "none" : "transform 0.15s ease-out",
                          width: "100%",
                          maxWidth: "320px",
                          transformStyle: "preserve-3d",
                          backgroundColor: "#000",
                          color: "#fff"
                        }}
                        className="border border-[var(--color-rule)] p-6 relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                        <div 
                          className="absolute w-40 h-40 rounded-full filter blur-[35px] opacity-35 pointer-events-none" 
                          style={{
                            background: product.accent,
                            top: "-15%",
                            right: "-15%"
                          }}
                        />

                        {/* Pass Header */}
                        <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-5">
                          <div>
                            <p className="mono-label text-[8px] text-white/50 tracking-[0.2em] mb-0.5">RITUAL PASS</p>
                            <p className="font-semibold text-base tracking-tight text-white">NUTRAVEY</p>
                          </div>
                          <span className="mono-label text-[8px] px-2 py-0.5 border border-white/20 text-white/80 uppercase">
                            VIP PASS
                          </span>
                        </div>

                        {/* Pass Body */}
                        <div className="flex flex-col gap-3 mb-6 text-left">
                          <div>
                            <p className="mono-label text-[7px] text-white/40 mb-0.5">RITUAL ALLOCATED</p>
                            <p className="font-medium text-[14px]" style={{ color: product.accent }}>{pdpTicket.flavor}</p>
                          </div>
                          <div>
                            <p className="mono-label text-[7px] text-white/40 mb-0.5">HOLDER</p>
                            <p className="font-medium text-[13px] text-white">{pdpTicket.name}</p>
                          </div>
                          <div>
                            <p className="mono-label text-[7px] text-white/40 mb-0.5">INVOICE CORRESPONDENCE</p>
                            <p className="font-mono text-[11px] text-white/70 break-all">{pdpTicket.email}</p>
                          </div>
                        </div>

                        {/* Barcode */}
                        <div className="flex justify-between items-end border-t border-white/10 pt-3 mt-auto">
                          <div>
                            <p className="mono-label text-[7px] text-white/40 mb-0.5">SLOT SERIAL</p>
                            <p className="font-mono text-[11px] tracking-widest text-white/90">{pdpTicket.id}</p>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <svg width="76" height="20" viewBox="0 0 100 24" className="text-white/80" fill="currentColor">
                              <rect x="0" y="0" width="3" height="24" />
                              <rect x="5" y="0" width="1" height="24" />
                              <rect x="8" y="0" width="4" height="24" />
                              <rect x="14" y="0" width="2" height="24" />
                              <rect x="18" y="0" width="1" height="24" />
                              <rect x="21" y="0" width="3" height="24" />
                              <rect x="26" y="0" width="5" height="24" />
                              <rect x="33" y="0" width="1" height="24" />
                              <rect x="36" y="0" width="2" height="24" />
                              <rect x="40" y="0" width="4" height="24" />
                              <rect x="46" y="0" width="1" height="24" />
                              <rect x="49" y="0" width="3" height="24" />
                              <rect x="54" y="0" width="6" height="24" />
                              <rect x="62" y="0" width="2" height="24" />
                              <rect x="66" y="0" width="1" height="24" />
                              <rect x="69" y="0" width="3" height="24" />
                              <rect x="74" y="0" width="4" height="24" />
                              <rect x="80" y="0" width="1" height="24" />
                              <rect x="83" y="0" width="2" height="24" />
                              <rect x="87" y="0" width="5" height="24" />
                              <rect x="94" y="0" width="1" height="24" />
                              <rect x="97" y="0" width="3" height="24" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="mono-body text-[10px] text-[var(--color-ink-muted)] mt-2">
                        ✓ Secured. Allocation reference code is {pdpTicket.id}.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
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
                  <button
                    type="button"
                    className="pdp-cta-primary mono-cta"
                    style={{ backgroundColor: product.accent }}
                    onClick={addToCart}
                    disabled={!purchasable || cartBusy}
                    aria-busy={cartBusy}
                  >
                    {cartBusy
                      ? "Adding…"
                      : purchasable
                        ? "Add to Cart"
                        : "Sold Out"}
                  </button>
                  <button
                    type="button"
                    className="pdp-cta-secondary mono-cta"
                    onClick={buyNow}
                    disabled={!purchasable || cartBusy}
                  >
                    Buy Now →
                  </button>
                </div>
              </>
            )}
            {!purchasable && (
              <p
                className="mono-body"
                style={{
                  fontSize: "11px",
                  color: "var(--color-ink-faint)",
                  marginTop: "12px",
                }}
              >
                {variantId
                  ? "Currently unavailable."
                  : "Storefront not connected — set your Shopify env vars to enable checkout."}
              </p>
            )}
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
          border: none;
          border-radius: 0;
          flex: 1;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .pdp-cta-primary:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .pdp-cta-primary:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .pdp-cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 24px;
          color: var(--color-ink);
          border: none;
          border-radius: 0;
          background: transparent;
          flex-shrink: 0;
          cursor: pointer;
          transition: opacity 200ms ease;
        }
        .pdp-cta-secondary:hover:not(:disabled) { opacity: 0.6; }
        .pdp-cta-secondary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

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
