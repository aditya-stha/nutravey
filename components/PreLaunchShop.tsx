"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { products, curation } from "@/lib/products";
import { track } from "@/lib/analytics";
import HoloTicket from "@/components/HoloTicket";

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
  const [selectedItem, setSelectedItem] = useState<string>("strawberry"); // strawberry | lychee | lemon | bundle
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ id: string; name: string; email: string; flavor: string } | null>(null);
  const [passUrl, setPassUrl] = useState<string | null>(null);

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
      const json: { ok?: boolean; id?: string; passUrl?: string; error?: string } =
        await res.json();

      if (!res.ok || !json.ok || !json.id) {
        setSubmitError(json.error ?? "Something went wrong. Try again.");
        return;
      }

      track("generate_lead", { item_id: selectedItem, source: "shop" });
      setPassUrl(json.passUrl ?? null);
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
                    {/* All three rituals, shown as a strip — the bundle IS
                        the three products. */}
                    <div className="relative w-44 h-56 flex-shrink-0 flex border border-[var(--color-rule)]">
                      {products.map((p) => (
                        <div key={p.id} className="relative flex-1 overflow-hidden" style={{ borderRight: p.position !== "right" ? "0.4px solid var(--color-rule)" : "none" }}>
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="60px"
                          />
                        </div>
                      ))}
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
                    <HoloTicket ticket={ticket} accent={activeAccent} />
                    <p className="mono-body text-[11px] text-[var(--color-ink-muted)] mt-4 text-center">
                      Reserved. Your slot is registered to {ticket.email} —
                      a confirmation with your private pass link is on its way.
                    </p>

                    {passUrl && (
                      <a
                        href={passUrl}
                        className="mono-cta text-[12px] mt-4"
                        style={{
                          color: "var(--color-ink)",
                          borderBottom: `1px solid ${activeAccent}`,
                          paddingBottom: "2px",
                        }}
                      >
                        View your pass &amp; launch countdown →
                      </a>
                    )}

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
