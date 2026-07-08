"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

/* Total splash time = HOLD + FADE. Tuned so the hero text reveal
   (in <GradientHero>) begins as the splash starts fading. */
const HOLD_MS = 1400;
const FADE_MS = 700;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function SplashScreen() {
  const [hiding, setHiding] = useState(false);
  const [unmount, setUnmount] = useState(false);

  useEffect(() => {
    // Repeat view this session (CSS already hides it via data-splash) or a
    // reduced-motion preference: skip straight past the hold + fade.
    const seen = document.documentElement.dataset.splash === "seen";
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduceMotion) {
      // Deferred past paint (lint: no sync setState in effects); the CSS
      // data-splash gate already hides the overlay this frame.
      const raf = requestAnimationFrame(() => setUnmount(true));
      return () => cancelAnimationFrame(raf);
    }
    const hide = setTimeout(() => setHiding(true), HOLD_MS);
    const remove = setTimeout(() => setUnmount(true), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, []);

  if (unmount) return null;

  return (
    <motion.div
      id="nvy-splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: hiding ? 0 : 1 }}
      transition={{ duration: FADE_MS / 1000, ease: EASE }}
      aria-hidden={hiding || undefined}
      role="status"
      aria-label="Loading Nutravey"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: hiding ? "none" : "auto",
        /* Subtle atmospheric breath so the splash doesn't read as a flat
           white/aubergine void. Very low intensity — barely there. */
        backgroundImage:
          "radial-gradient(ellipse 50% 40% at 50% 50%, color-mix(in srgb, var(--color-ink) 4%, transparent) 0%, transparent 70%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: EASE }}
        style={{ color: "var(--color-ink)", lineHeight: 0 }}
      >
        <Logo style={{ height: "44px" }} />
      </motion.div>

      {/* Progress bar — track underneath, fill draws across on top.
          Wider and heavier than a hairline so the loading cue actually
          reads as a loading cue. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "calc(12vh + env(safe-area-inset-bottom, 0))",
          width: "180px",
          height: "2px",
          borderRadius: "2px",
          overflow: "hidden",
          /* Faint track so users can see the bar's length even before the
             fill catches up. */
          backgroundColor: "color-mix(in srgb, var(--color-ink) 12%, transparent)",
        }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: (HOLD_MS - 150) / 1000, ease: EASE, delay: 0.15 }}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "var(--color-ink)",
            opacity: 0.7,
            transformOrigin: "left center",
          }}
        />
      </div>
    </motion.div>
  );
}
