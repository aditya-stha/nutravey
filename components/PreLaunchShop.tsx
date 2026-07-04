"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { products, curation } from "@/lib/products";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Dynamic backgrounds for each flavor to color the pre-launch environment
const atmospheres: Record<string, { bg: string; textAccent: string }> = {
  strawberry: {
    bg: "radial-gradient(circle at 80% 20%, rgba(197,43,86,0.12) 0%, transparent 50%)",
    textAccent: "#C52B56",
  },
  lychee: {
    bg: "radial-gradient(circle at 80% 20%, rgba(170,65,152,0.12) 0%, transparent 50%)",
    textAccent: "#AA4198",
  },
  lemon: {
    bg: "radial-gradient(circle at 80% 20%, rgba(250,220,51,0.12) 0%, transparent 50%)",
    textAccent: "#C9A810",
  },
  bundle: {
    bg: "radial-gradient(circle at 80% 20%, rgba(61,19,34,0.12) 0%, transparent 50%)",
    textAccent: "#3D1322",
  },
};

export default function PreLaunchShop() {
  const reduce = useReducedMotion();
  const [selectedItem, setSelectedItem] = useState<string>("strawberry"); // strawberry | lychee | lemon | bundle
  const [selectedIngredient, setSelectedIngredient] = useState<string>("coconut"); // coconut | cherry | magnesium | theanine
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ id: string; name: string; email: string; flavor: string } | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Interactive 3D Card Hover Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Normalise tilt values (up to 12 degrees)
    const tiltX = (y / (box.height / 2)) * -12;
    const tiltY = (x / (box.width / 2)) * 12;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Turnstile token, when the widget is active (env-gated).
      const turnstileToken =
        (window as unknown as { turnstile?: { getResponse: () => string } })
          .turnstile?.getResponse() ?? "";

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          item: selectedItem,
          turnstileToken,
          company: honeypot,
        }),
      });
      const json: { ok?: boolean; id?: string; error?: string } =
        await res.json();

      if (!res.ok || !json.ok || !json.id) {
        setSubmitError(json.error ?? "Something went wrong. Try again.");
        return;
      }

      setTicket({
        id: json.id,
        name: name,
        email: email,
        flavor: selectedItem === "bundle" ? "The Curation Box" : products.find(p => p.id === selectedItem)?.name || "Ritual Set",
      });
    } catch {
      setSubmitError("Couldn't reach the reservation service. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Find active product specs
  const activeProduct = products.find(p => p.id === selectedItem);
  const activeAccent = selectedItem === "bundle" ? atmospheres.bundle.textAccent : activeProduct?.accent || "#3D1322";

  return (
    <div 
      className="pre-launch-container transition-all duration-700 ease-in-out"
      style={{ 
        backgroundColor: "var(--color-surface)",
        backgroundImage: atmospheres[selectedItem]?.bg || atmospheres.strawberry.bg,
        backgroundAttachment: "fixed"
      }}
    >
      {/* ── Squircle definition ─────────────────────────────────────────── */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.05,0 L 0.95,0 C 0.978,0 1,0.022 1,0.05 L 1,0.95 C 1,0.978 0.978,1 0.95,1 L 0.05,1 C 0.022,1 0,0.978 0,0.95 L 0,0.05 C 0,0.022 0.022,0 0.05,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── Page Header Section ────────────────────────────────────────── */}
      <section className="content-rail" style={{ paddingTop: "clamp(64px, 8vw, 96px)", paddingBottom: "clamp(36px, 4vw, 56px)" }}>
        <p className="mono-label" style={{ opacity: 0.5, marginBottom: "18px" }}>
          EXHIBITION & WAITLIST · LAUNCH PHASE 01
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(48px, 7vw, 96px)",
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          maxWidth: "880px",
          color: "var(--color-ink)",
          marginBottom: "32px"
        }}>
          Reserve Your Ritual.
        </h1>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "15px",
          lineHeight: 1.7,
          color: "var(--color-ink-muted)",
          maxWidth: "640px"
        }}>
          Nutravey is in the final stages of formulation matching. We are opening limited priority reservations. Secure your batch slot below—no payment needed until release.
        </p>
      </section>

      <hr className="content-rail" style={{ margin: "48px auto" }} />

      {/* ── Interactive Reservation Zone ───────────────────────────────── */}
      <section className="content-rail py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Interactive Product Selector & Info (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <h2 className="mono-label mb-6" style={{ color: activeAccent, transition: "color 0.5s ease" }}>
              STEP 1: CHOOSE YOUR SLATE
            </h2>

            {/* Flavor Tabs */}
            <div className="flex flex-wrap gap-3">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedItem(p.id)}
                  className={`mono-cta px-5 py-3 border rounded-none transition-all duration-300 ${
                    selectedItem === p.id 
                      ? "bg-[var(--color-ink)] text-[var(--color-surface)] border-[var(--color-ink)]"
                      : "border-[var(--color-rule)] hover:opacity-80"
                  }`}
                  style={{ 
                    borderColor: selectedItem === p.id ? activeAccent : undefined,
                    backgroundColor: selectedItem === p.id ? activeAccent : undefined,
                  }}
                >
                  {p.flavour}
                </button>
              ))}
              <button
                onClick={() => setSelectedItem("bundle")}
                className={`mono-cta px-5 py-3 border rounded-none transition-all duration-300 ${
                  selectedItem === "bundle"
                    ? "bg-[var(--color-ink)] text-[var(--color-surface)] border-[var(--color-ink)]"
                    : "border-[var(--color-rule)] hover:opacity-80"
                }`}
                style={{ 
                  borderColor: selectedItem === "bundle" ? atmospheres.bundle.textAccent : undefined,
                  backgroundColor: selectedItem === "bundle" ? atmospheres.bundle.textAccent : undefined,
                }}
              >
                The Curation Bundle
              </button>
            </div>

            {/* Spotlight Showcase */}
            <div className="border border-[var(--color-rule)] p-10 md:p-12 relative overflow-hidden bg-[var(--color-surface-card)]" style={{ minHeight: "400px", boxShadow: "0 20px 60px rgba(15, 23, 42, 0.06)" }}>
              <AnimatePresence mode="wait">
                {selectedItem !== "bundle" && activeProduct ? (
                  <motion.div
                    key={activeProduct.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col md:flex-row gap-8 items-center"
                  >
                    <div className="relative w-44 h-56 flex-shrink-0" style={{ clipPath: "url(#squircle-clip)" }}>
                      <Image 
                        src={activeProduct.image} 
                        alt={activeProduct.name} 
                        fill 
                        className="object-cover"
                        sizes="176px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="mono-label text-[11px] mb-2" style={{ color: activeProduct.accent }}>
                        {activeProduct.flavour} Set · 30 Servings
                      </p>
                      <h3 className="mb-3" style={{ fontSize: "28px", color: "var(--color-ink)" }}>
                        {activeProduct.name}
                      </h3>
                      <p className="mono-body text-[14px] text-[var(--color-ink-muted)] mb-4 leading-relaxed">
                        {activeProduct.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {activeProduct.ingredients.slice(0, 3).map((ing, i) => (
                          <span
                            key={i}
                            className="mono-label text-[9px] px-2.5 py-1 border bg-transparent inline-block text-[var(--color-ink-muted)] border-[var(--color-rule)]"
                            style={{ textDecoration: "none" }}
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-2xl">{activeProduct.priceLabel}</span>
                        <span className="mono-label text-[10px] opacity-40">MSRP on Launch</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bundle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col md:flex-row gap-8 items-center"
                  >
                    <div className="relative w-44 h-56 flex-shrink-0 bg-[var(--color-surface-warm)] flex items-center justify-center" style={{ clipPath: "url(#squircle-clip)" }}>
                      <span className="mono-label text-center opacity-40 p-4">Full Curation System</span>
                    </div>
                    <div className="flex-1">
                      <p className="mono-label text-[11px] mb-2" style={{ color: atmospheres.bundle.textAccent }}>
                        Full Experience · 90 Sachets Total
                      </p>
                      <h3 className="mb-3" style={{ fontSize: "28px", color: "var(--color-ink)" }}>
                        {curation.name}
                      </h3>
                      <p className="mono-body text-[14px] text-[var(--color-ink-muted)] mb-4 leading-relaxed">
                        {curation.description} Get Strawberry Surge, Lychee Lush, and Lemon Zest combined into a complete 90-sachet supply with priority launch discount.
                      </p>
                      <div className="flex items-baseline gap-3">
                        <span className="font-semibold text-2xl" style={{ color: atmospheres.bundle.textAccent }}>{curation.bundlePriceLabel}</span>
                        <span className="line-through opacity-40 text-sm">{curation.listPriceLabel}</span>
                        <span className="mono-label text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 border border-green-300 dark:border-green-800">
                          {curation.savingsLabel}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Interaction Form / Generated Ticket (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <h2 className="mono-label mb-6" style={{ color: activeAccent, transition: "color 0.5s ease" }}>
              STEP 2: CLAIM RESERVATION
            </h2>

            <div className="relative">
              <AnimatePresence mode="wait">
                {!ticket ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="border border-[var(--color-rule)] p-10 lg:p-10 bg-[var(--color-surface-card)] relative"
                  >
                    <p className="mono-body text-[13px] text-[var(--color-ink-muted)] mb-6">
                      Pre-order allocation is 100% free. When the store goes live, you will receive an early billing invoice via email to confirm purchase with a 15% VIP discount.
                    </p>

                    <form onSubmit={handleReserve} className="flex flex-col gap-5">
                      <div>
                        <label htmlFor="name-input" className="mono-label text-[10px] block mb-2 opacity-60">Full Name</label>
                        <input
                          id="name-input"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Aditya Shrestha"
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] px-4 py-3 font-mono text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
                          style={{ borderRadius: 0 }}
                        />
                      </div>
                      <div>
                        <label htmlFor="email-input" className="mono-label text-[10px] block mb-2 opacity-60">Email Address</label>
                        <input
                          id="email-input"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="aditya@example.com"
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] px-4 py-3 font-mono text-[14px] focus:outline-none focus:border-[var(--color-ink)]"
                          style={{ borderRadius: 0 }}
                        />
                      </div>

                      {/* Honeypot — hidden from humans, filled by bots. */}
                      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
                        <label htmlFor="company-input">Company</label>
                        <input
                          id="company-input"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </div>

                      {turnstileSiteKey && (
                        <>
                          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
                          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="auto" />
                        </>
                      )}

                      {submitError && (
                        <p
                          role="alert"
                          className="mono-body text-[13px]"
                          style={{
                            color: activeAccent,
                            borderTop: "0.4px solid var(--color-rule)",
                            paddingTop: "12px",
                          }}
                        >
                          {submitError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mono-cta w-full py-4 text-center text-white bg-[var(--color-ink)] border border-[var(--color-ink)] hover:bg-transparent hover:text-[var(--color-ink)] transition-all duration-300 mt-2 disabled:opacity-50"
                        style={{
                          backgroundColor: activeAccent,
                          borderColor: activeAccent,
                        }}
                      >
                        {isSubmitting ? "ALLOCATING..." : "RESERVE SLOT"}
                      </button>
                    </form>

                    <div className="flex items-center gap-2 mt-6 justify-center opacity-40">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="mono-label text-[9px]">Official Secure Waitlist</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ticket"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="flex flex-col items-center"
                  >
                    {/* Interactive 3D Card */}
                    <div
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                        transition: reduce ? "none" : "transform 0.15s ease-out",
                        width: "100%",
                        maxWidth: "340px",
                        transformStyle: "preserve-3d",
                        backgroundColor: "var(--color-surface-footer)",
                        color: "var(--color-cream)",
                      }}
                      className="border border-[var(--color-rule)] p-6 relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Ticket Gloss Background Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                      <div 
                        className="absolute w-48 h-48 rounded-full filter blur-[40px] opacity-40 pointer-events-none" 
                        style={{
                          background: activeAccent,
                          top: "-20%",
                          right: "-20%"
                        }}
                      />

                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
                        <div>
                          <p className="mono-label text-[8px] text-white/50 tracking-[0.2em] mb-1">RITUAL PASS</p>
                          <p className="font-semibold text-lg tracking-tight">NUTRAVEY</p>
                        </div>
                        <span className="mono-label text-[9px] px-2 py-0.5 border border-white/20 text-white/80 uppercase">
                          VIP PRIORITY
                        </span>
                      </div>

                      {/* Ticket Body */}
                      <div className="flex flex-col gap-4 mb-8">
                        <div>
                          <p className="mono-label text-[8px] text-white/40 mb-0.5">ALLOCATED SLATE</p>
                          <p className="font-medium text-[15px]" style={{ color: activeAccent }}>{ticket.flavor}</p>
                        </div>
                        <div>
                          <p className="mono-label text-[8px] text-white/40 mb-0.5">RESERVED FOR</p>
                          <p className="font-medium text-[15px]">{ticket.name}</p>
                        </div>
                        <div>
                          <p className="mono-label text-[8px] text-white/40 mb-0.5">EMAIL CORRESPONDENCE</p>
                          <p className="font-mono text-xs text-white/70 break-all">{ticket.email}</p>
                        </div>
                      </div>

                      {/* Barcode & Identifier */}
                      <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-auto">
                        <div>
                          <p className="mono-label text-[8px] text-white/40 mb-0.5">SLOT ID</p>
                          <p className="font-mono text-sm tracking-widest text-white/90">{ticket.id}</p>
                        </div>
                        
                        {/* Styled SVG Barcode */}
                        <div className="flex flex-col items-center">
                          <svg width="84" height="24" viewBox="0 0 100 24" className="text-white/80" fill="currentColor">
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

                    <p className="mono-body text-[11px] text-[var(--color-ink-muted)] mt-4 text-center">
                      ✓ Reserved. We sent a validation pass to {ticket.email}.
                    </p>

                    <button
                      onClick={() => setTicket(null)}
                      className="mono-cta text-[11px] underline opacity-50 hover:opacity-100 transition-opacity mt-4 cursor-pointer"
                    >
                      Make another reservation
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* ── Brand Storytelling Section ── */}
      <section className="bg-[var(--color-surface-warm)] border-t border-b border-[var(--color-rule)] my-24 py-28 lg:py-32">
        <div className="content-rail">
          <p className="mono-label text-center opacity-50 mb-10">THE NUTRAVEY PHILOSOPHY</p>
          <h2 className="text-center mb-20 md:mb-28 lg:mb-32" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4.5vw, 56px)", color: "var(--color-ink)", letterSpacing: "-0.02em" }}>
            Pills are Yesterday.<br/>Sachets are Tomorrow.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-14 lg:gap-20">
            <div className="border border-[var(--color-rule)] p-10 lg:p-12 bg-[var(--color-surface)]">
              <span className="mono-label text-xs block mb-6" style={{ color: atmospheres.strawberry.textAccent }}>01 / PURE CELLULAR UPTAKE</span>
              <h3 className="text-xl mb-6">No Binders, Ever</h3>
              <p className="mono-body text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
                Traditional multivitamin tablets are packed with silicon dioxide, magnesium stearate, and microcrystalline cellulose. Nutravey is raw soluble powder. Just pour into water and sip.
              </p>
            </div>

            <div className="border border-[var(--color-rule)] p-10 lg:p-12 bg-[var(--color-surface)]">
              <span className="mono-label text-xs block mb-6" style={{ color: atmospheres.lychee.textAccent }}>02 / OPTIMAL RATIO HYDRATION</span>
              <h3 className="text-xl mb-6">Magnesium Glycinate</h3>
              <p className="mono-body text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
                Most hydration packs dump cheap sodium and citric acids. We utilize high-absorption Magnesium Glycinate alongside clinical levels of Potassium and Sodium to lock in cellular hydration.
              </p>
            </div>

            <div className="border border-[var(--color-rule)] p-10 lg:p-12 bg-[var(--color-surface)]">
              <span className="mono-label text-xs block mb-6" style={{ color: atmospheres.lemon.textAccent }}>03 / TRIPLE LAB TESTING</span>
              <h3 className="text-xl mb-6">Indisputable Purity</h3>
              <p className="mono-body text-[13px] text-[var(--color-ink-muted)] leading-relaxed">
                Every batch is triple-tested for heavy metals, yeast, and chemical pesticides. We publish all Certificates of Analysis (COAs) publicly to prove we build with absolute trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Active Ingredients Interactive Explorer ── */}
      <section className="content-rail py-32 lg:py-36">
        <p className="mono-label opacity-50 mb-10 text-center">UNDER THE MICROSCOPE</p>
        <h2 className="text-center mb-20 md:mb-28" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)" }}>
          Active Botanical Sourcing.
        </h2>

        <div className="border border-[var(--color-rule)] p-14 lg:p-16 bg-[var(--color-surface)] grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-stretch">
          
          {/* Active Ingredients List */}
          <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--color-rule)] pb-10 lg:pb-0 lg:pr-12">
            <div>
              <p className="mono-body text-[13px] text-[var(--color-ink-muted)] mb-6">
                Select an active compound to verify its primary biological purpose and organic origin.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { id: "coconut", name: "Coconut Water Extract", origin: "Organic Philippines" },
                  { id: "cherry", name: "Acerola Cherry Extract", origin: "Northeastern Brazil" },
                  { id: "magnesium", name: "Magnesium Glycinate", origin: "Biologically Chelated" },
                  { id: "theanine", name: "L-Theanine", origin: "Japanese Green Tea" },
                ].map(ing => (
                  <button
                    key={ing.id}
                    onClick={() => setSelectedIngredient(ing.id)}
                    className={`text-left py-3 px-4 mono-cta text-[12px] border transition-all flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50 ${
                      selectedIngredient === ing.id ? "border-[var(--color-ink)]" : "border-transparent hover:border-[var(--color-rule)]"
                    }`}
                  >
                    <span>{ing.name}</span>
                    <span className="opacity-40 text-[9px]">{ing.origin}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-10">
              <span className="mono-label text-[9px] block opacity-40">STANDARD GUARANTEE</span>
              <p className="text-[12px] mono-body text-[var(--color-ink-faint)]">
                All components are non-GMO, gluten-free, vegan-friendly, and naturally sweetened.
              </p>
            </div>
          </div>

          {/* Ingredient Details Showcase */}
          <div className="lg:col-span-8 flex flex-col justify-center pl-0 lg:pl-4">
            <AnimatePresence mode="wait">
              {selectedIngredient === "coconut" && (
                <motion.div key="coconut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <span className="mono-label text-xs text-[#C52B56]">FULL-SPECTRUM ELECTROLYTES</span>
                  <h4 style={{ fontSize: "24px" }}>Organic Coconut Water</h4>
                  <p className="mono-body text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
                    Hydration relies on balance. Coconut water concentrate yields organic potassium in ratios that match human cellular fluid, helping nutrients cross the cell membrane efficiently.
                  </p>
                </motion.div>
              )}
              {selectedIngredient === "cherry" && (
                <motion.div key="cherry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <span className="mono-label text-xs text-[#AA4198]">ANTIOXIDANT METABOLISM</span>
                  <h4 style={{ fontSize: "24px" }}>Brazilian Acerola</h4>
                  <p className="mono-body text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
                    Synthetic ascorbic acid is standard in cheap brands. We harvest Brazillian Acerola cherries to extract natural, bio-available Vitamin C complexed with natural bioflavonoids for high cellular absorption.
                  </p>
                </motion.div>
              )}
              {selectedIngredient === "magnesium" && (
                <motion.div key="magnesium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <span className="mono-label text-xs text-[#C9A810]">MUSCLE & NERVE ADAPTATION</span>
                  <h4 style={{ fontSize: "24px" }}>Chelated Magnesium Glycinate</h4>
                  <p className="mono-body text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
                    Magnesium oxide can irritate the gastrointestinal tract. By chelating magnesium with the amino acid glycine, we create a stable salt that is gentle on the stomach and supports neural pathways.
                  </p>
                </motion.div>
              )}
              {selectedIngredient === "theanine" && (
                <motion.div key="theanine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <span className="mono-label text-xs text-[#3D1322]">COGNITIVE CALM</span>
                  <h4 style={{ fontSize: "24px" }}>Pure L-Theanine Extract</h4>
                  <p className="mono-body text-[14px] text-[var(--color-ink-muted)] leading-relaxed">
                    Extracted from premium Japanese green tea, L-Theanine crosses the blood-brain barrier to promote alpha brain waves, creating a quiet focus and sustained clarity without any mid-day crash.
                  </p>
                </motion.div>
              )}
              {/* Fallback case */}
              {!["coconut", "cherry", "magnesium", "theanine"].includes(selectedIngredient) && (
                <motion.div key="select-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto opacity-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p className="mono-body text-sm text-[var(--color-ink-faint)]">
                    Please select an ingredient on the left to inspect its biological details.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* ── Transparent Launch Timeline ── */}
      <section className="content-rail py-32 lg:py-36">
        <p className="mono-label opacity-50 mb-10 text-center">TRANSPARENCY TIMELINE</p>
        <h2 className="text-center mb-20 md:mb-28" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)" }}>
          Launch Sequence.
        </h2>

        <div className="relative border-l border-[var(--color-rule)] pl-8 max-w-2xl mx-auto flex flex-col gap-16">
          
          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-white dark:ring-[#2D0F2A]" />
            <span className="mono-label text-[10px] text-green-600 block mb-1">STAGE 01 - DONE (JUNE 2026)</span>
            <h4 className="text-[17px] mb-2 font-medium">Formulation Locking & Batch Certifications</h4>
            <p className="mono-body text-[13px] text-[var(--color-ink-muted)]">
              All recipe matrices for Strawberry Surge, Lychee Lush, and Lemon Zest locked. Triple-stage laboratory tests completed with zero heavy metals.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-yellow-500 rounded-full ring-4 ring-white dark:ring-[#2D0F2A]" />
            <span className="mono-label text-[10px] text-yellow-600 block mb-1">STAGE 02 - ACTIVE (JULY 2026)</span>
            <h4 className="text-[17px] mb-2 font-medium">Priority Waitlist Openings</h4>
            <p className="mono-body text-[13px] text-[var(--color-ink-muted)]">
              Opening VIP batch allocation reserves. Allowing early fans to secure a box in the initial run to correctly pace primary production.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-neutral-300 rounded-full ring-4 ring-white dark:ring-[#2D0F2A]" />
            <span className="mono-label text-[10px] text-[var(--color-ink-faint)] block mb-1">STAGE 03 - PENDING (AUGUST 2026)</span>
            <h4 className="text-[17px] mb-2 font-medium">Batch 01 Production & Packing</h4>
            <p className="mono-body text-[13px] text-[var(--color-ink-faint)]">
              Primary production runs in our cGMP-certified facility in California. Hermetic packaging of sachets in custom recyclable mailer boxes.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-neutral-300 rounded-full ring-4 ring-white dark:ring-[#2D0F2A]" />
            <span className="mono-label text-[10px] text-[var(--color-ink-faint)] block mb-1">STAGE 04 - PENDING (SEPTEMBER 2026)</span>
            <h4 className="text-[17px] mb-2 font-medium">Waitlist Delivery Dispatch</h4>
            <p className="mono-body text-[13px] text-[var(--color-ink-faint)]">
              Waitlist passes are billed with the 15% pre-launch discount and dispatched via DHL Express / FedEx directly to doors.
            </p>
          </div>

        </div>
      </section>

      {/* ── Brand Trust & Anti-Scam Verification ── */}
      <section className="bg-black text-white py-32 lg:py-36 border-t border-white/10">
        <div className="content-rail text-center max-w-3xl">
          <p className="mono-label text-white/50 mb-8">SECURITY & TRUST CERTIFICATION</p>
          <h2 className="mb-20 text-white" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 44px)" }}>
            Shop Confidently.
          </h2>
          <p className="mono-body text-sm text-white/70 leading-relaxed mb-12">
            Nutravey relies on direct Shopify systems. When transactions go live, payments will occur on our verified custom checkout domain (<code className="bg-white/10 px-1 py-0.5 rounded text-white font-semibold">checkout.nutravey.com</code>) using industry-standard PCI-DSS Level 1 encryption. We never store credit card records, and all waitlist entries can be cancelled with a single click.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-60">
            <div className="flex flex-col items-center">
              <span className="mono-label text-[10px] text-white/80">POWERED BY</span>
              <span className="font-semibold text-sm">SHOPIFY PAYMENTS</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mono-label text-[10px] text-white/80">ENCRYPTION</span>
              <span className="font-semibold text-sm">AES-256 SSL</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mono-label text-[10px] text-white/80">STANDARDS</span>
              <span className="font-semibold text-sm">cGMP CERTIFIED</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mono-label text-[10px] text-white/80">SUPPORT</span>
              <span className="font-semibold text-sm">24/7 VERIFIED</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
