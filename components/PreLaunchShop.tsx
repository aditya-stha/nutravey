"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { products, curation } from "@/lib/products";
import { track } from "@/lib/analytics";

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

      track("generate_lead", { item_id: selectedItem, source: "shop" });
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
            <div className="border border-[var(--color-rule)] p-10 md:p-12 relative overflow-hidden bg-[var(--color-surface-card)]" style={{ minHeight: "400px" }}>
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
                    <div className="relative w-44 h-56 flex-shrink-0">
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
                    <div className="relative w-44 h-56 flex-shrink-0 bg-[var(--color-surface-warm)] flex items-center justify-center border border-[var(--color-rule)]">
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
                        <span className="mono-label text-[10px] px-2 py-0.5 border border-[var(--color-rule)]" style={{ color: atmospheres.bundle.textAccent }}>
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
                    {/* Interactive 3D holo card. The iridescent sheen's
                        position and the foil badge's hue rotation are driven
                        by the same tilt values as the card itself, so the
                        hologram shifts with viewing angle like real foil. */}
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
                        borderColor: `color-mix(in srgb, ${activeAccent} 45%, transparent)`,
                        boxShadow: `0 0 70px -22px ${activeAccent}`,
                      }}
                      className="border p-6 relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Iridescent sheen — rides the tilt */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          background:
                            "linear-gradient(115deg, transparent 30%, rgba(94,240,255,0.10) 42%, rgba(255,94,247,0.13) 50%, rgba(160,255,140,0.10) 58%, transparent 70%)",
                          backgroundSize: "300% 300%",
                          backgroundPosition: `${50 - tilt.y * 4}% ${50 - tilt.x * 4}%`,
                          mixBlendMode: "screen",
                          transition: reduce ? "none" : "background-position 0.15s ease-out",
                        }}
                      />
                      {/* Micro scanlines */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          background:
                            "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
                        }}
                      />
                      {/* Spectral top edge */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "1px",
                          background: `linear-gradient(90deg, transparent, rgba(94,240,255,0.5), ${activeAccent}, rgba(255,94,247,0.5), transparent)`,
                        }}
                      />

                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
                        <div>
                          <p className="mono-label text-[8px] text-white/50 tracking-[0.2em] mb-1">RITUAL PASS</p>
                          <p className="font-semibold text-lg tracking-tight">NUTRAVEY</p>
                        </div>
                        {/* Holo-foil badge: conic border rotates with tilt */}
                        <span
                          className="mono-label text-[9px] px-2 py-0.5 text-white/90 uppercase"
                          style={{
                            border: "1px solid transparent",
                            backgroundImage: `linear-gradient(var(--color-surface-footer), var(--color-surface-footer)), conic-gradient(from ${135 + tilt.y * 14}deg, rgba(94,240,255,0.9), ${activeAccent}, rgba(255,94,247,0.9), rgba(160,255,140,0.8), rgba(94,240,255,0.9))`,
                            backgroundOrigin: "border-box",
                            backgroundClip: "padding-box, border-box",
                          }}
                        >
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
                      Reserved. Your slot is registered to {ticket.email}.
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

    </div>
  );
}
