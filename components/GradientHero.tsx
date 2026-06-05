"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

/* Hero text-reveal timing — staggered so the headline arrives as the
   <SplashScreen> begins fading out (splash HOLD = 1.4s + FADE = 0.7s).
   Cubic-bezier(0.22, 1, 0.36, 1) is the cinematic out-cubic curve. */
const HERO_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const HERO_DELAYS = {
  eyebrow: 1.4,
  line1: 1.6,
  line2: 1.85,
  body: 2.25,
  cta: 2.55,
};

/* ─── Atmospheric palettes ───────────────────────────────────────────────
   Hero section's gradient backdrop. Cycles between three flavour washes. */
const lightAtmospheres = [
  {
    id: "strawberry",
    background: `
      radial-gradient(circle at 18% 22%, rgba(244,220,226,0.95) 0%, transparent 42%),
      radial-gradient(circle at 58% 48%, rgba(232,154,176,0.82) 0%, transparent 36%),
      radial-gradient(circle at 88% 84%, rgba(196,27,74,0.72) 0%, transparent 30%),
      #E8DDD0
    `,
  },
  {
    id: "lychee",
    background: `
      radial-gradient(circle at 15% 18%, rgba(248,225,236,0.95) 0%, transparent 44%),
      radial-gradient(circle at 52% 54%, rgba(216,138,184,0.82) 0%, transparent 36%),
      radial-gradient(circle at 48% 92%, rgba(170,65,152,0.72) 0%, transparent 30%),
      radial-gradient(circle at 84% 20%, rgba(168,212,226,0.42) 0%, transparent 22%),
      #E8DDD0
    `,
  },
  {
    id: "lemon",
    background: `
      radial-gradient(circle at 18% 14%, rgba(252,244,210,0.95) 0%, transparent 42%),
      radial-gradient(circle at 56% 50%, rgba(240,220,96,0.82) 0%, transparent 36%),
      radial-gradient(circle at 82% 82%, rgba(201,168,16,0.72) 0%, transparent 30%),
      #E8DDD0
    `,
  },
];

/* Dark variant — vibrant like the light theme, but tuned for the lifted
   dark base. A soft pastel top, a saturated mid, and a deep accent bottom-
   right, with a left-side vignette keeping the headline area legible. */
const darkAtmospheres = [
  {
    id: "strawberry",
    background: `
      radial-gradient(ellipse 55% 50% at 78% 28%, rgba(238,168,188,0.55) 0%, transparent 50%),
      radial-gradient(ellipse 50% 45% at 60% 58%, rgba(220,80,128,0.70) 0%, transparent 55%),
      radial-gradient(ellipse 45% 40% at 92% 82%, rgba(196,27,74,0.75) 0%, transparent 55%),
      radial-gradient(ellipse 60% 70% at 0% 50%, rgba(18,6,20,0.55) 0%, transparent 55%),
      var(--color-surface-hero)
    `,
  },
  {
    id: "lychee",
    background: `
      radial-gradient(ellipse 55% 50% at 80% 22%, rgba(228,168,210,0.55) 0%, transparent 50%),
      radial-gradient(ellipse 50% 45% at 58% 58%, rgba(190,90,178,0.70) 0%, transparent 55%),
      radial-gradient(ellipse 50% 45% at 55% 92%, rgba(170,65,152,0.75) 0%, transparent 55%),
      radial-gradient(ellipse 35% 32% at 92% 22%, rgba(150,200,220,0.30) 0%, transparent 50%),
      radial-gradient(ellipse 60% 70% at 0% 50%, rgba(18,6,20,0.55) 0%, transparent 55%),
      var(--color-surface-hero)
    `,
  },
  {
    id: "lemon",
    background: `
      radial-gradient(ellipse 55% 50% at 78% 20%, rgba(252,232,140,0.55) 0%, transparent 50%),
      radial-gradient(ellipse 50% 45% at 60% 54%, rgba(232,194,60,0.70) 0%, transparent 55%),
      radial-gradient(ellipse 45% 40% at 88% 84%, rgba(201,168,16,0.75) 0%, transparent 55%),
      radial-gradient(ellipse 60% 70% at 0% 50%, rgba(18,6,20,0.55) 0%, transparent 55%),
      var(--color-surface-hero)
    `,
  },
];

function useThemeAttribute(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export default function GradientHero() {
  const prefersReducedMotion = useReducedMotion();
  const theme = useThemeAttribute();
  const sectionRef = useRef<HTMLElement>(null);
  const atmospheres = theme === "dark" ? darkAtmospheres : lightAtmospheres;

  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % atmospheres.length);
    }, 5000);
    return () => clearInterval(id);
  }, [prefersReducedMotion, atmospheres.length]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100vh",
        background: "var(--color-surface-hero)",
      }}
    >
      {/* Atmospheric cycling backdrop */}
      <div style={{ position: "absolute", inset: 0 }}>
        {atmospheres.map((atm, i) => (
          <motion.div
            key={atm.id}
            animate={{
              opacity: i === current ? 1 : 0,
              x: i === current ? [0, -20, 0] : 0,
              y: i === current ? [0, 20, 0] : 0,
            }}
            transition={{
              opacity: { duration: 2.4, ease: "easeInOut" },
              x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              position: "absolute",
              inset: "-10%",
              background: atm.background,
              filter: "blur(24px)",
              willChange: "transform, opacity",
            }}
          />
        ))}

        {/* Texture wash */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(250,250,250,0.04), rgba(61,19,34,0.03))",
            mixBlendMode: "soft-light",
          }}
        />

        {/* Bottom fade — blends the cycling gradients into the next
            section's surface so there's no hard edge where the hero ends. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "30%",
            background:
              "linear-gradient(to bottom, transparent 0%, var(--color-surface) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Content — staggered reveal that begins as the splash fades. */}
      <div
        className="content-rail"
        style={{
          position: "relative",
          zIndex: 2,
          height: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: "640px" }}>
          {/* Eyebrow */}
          <motion.p
            className="mono-label"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: HERO_DELAYS.eyebrow, ease: HERO_EASE }}
          >
            NUTRAVEY · HYDRATION + MULTIVITAMINS
          </motion.p>

          {/* Headline — each line slides up from a clip mask, classic
              luxury editorial reveal. */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(56px, 9vw, 112px)",
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
              color: "var(--color-ink)",
              marginTop: "32px",
              marginBottom: "28px",
            }}
          >
            <span className="hero-line-mask">
              <motion.span
                className="hero-line-inner"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 1.05,
                  delay: HERO_DELAYS.line1,
                  ease: HERO_EASE,
                }}
              >
                your daily
              </motion.span>
            </span>
            <span className="hero-line-mask">
              <motion.span
                className="hero-line-inner"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 1.05,
                  delay: HERO_DELAYS.line2,
                  ease: HERO_EASE,
                }}
              >
                hydration 
              </motion.span>
            </span>
            <span className="hero-line-mask">
              <motion.span
                className="hero-line-inner"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 1.05,
                  delay: HERO_DELAYS.line2,
                  ease: HERO_EASE,
                }}
              >
                ritual. 
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: HERO_DELAYS.body, ease: HERO_EASE }}
            style={{
              maxWidth: "420px",
              fontSize: "18px",
              lineHeight: 1.6,
              color: "var(--color-ink-muted)",
              marginBottom: "40px",
            }}
          >
            True wellness begins within you. Revive your ritual.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: HERO_DELAYS.cta, ease: HERO_EASE }}
            style={{ display: "inline-block" }}
          >
            <Link href="/shop" className="mono-cta">
              Explore the collection →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scoped styles for the headline line-reveal clip mask. */}
      <style>{`
        .hero-line-mask {
          display: block;
          overflow: hidden;
          /* Add em-based vertical padding so descenders ('y' in 'daily')
             aren't clipped during the slide; cancelled by negative margin
             on the inner span so layout doesn't shift. */
          padding: 0.08em 0;
          margin: -0.08em 0;
        }
        .hero-line-inner {
          display: inline-block;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
