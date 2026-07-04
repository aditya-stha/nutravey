"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HoloTicket from "@/components/HoloTicket";
import { products, curation } from "@/lib/products";

/* ─── Private pass view ─────────────────────────────────────────────────────
   A verified Ritual Pass, presented like the artifact it is: a single
   centered column — greeting, holo ticket, launch countdown. (Centered by
   the user's explicit direction; this page is an artifact viewer, not an
   editorial content block.) */

interface Pass {
  id: string;
  name: string;
  email: string;
  item: string;
  flavor: string;
}

const LAUNCH_ISO =
  process.env.NEXT_PUBLIC_LAUNCH_DATE ?? "2026-09-01T16:00:00Z";

function remaining(to: number) {
  const ms = Math.max(0, to - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    done: ms === 0,
  };
}

function Countdown({ accent }: { accent: string }) {
  const target = new Date(LAUNCH_ISO).getTime();
  // null until mounted — the server can't know the client's "now", so
  // rendering digits on the server would guarantee a hydration mismatch.
  const [t, setT] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    const tick = () => setT(remaining(target));
    // First tick lands after paint (satisfies react-hooks/set-state-in-effect);
    // the placeholder "--" digits only exist for one frame.
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, [target]);

  if (t?.done) {
    return (
      <p className="mono-cta" style={{ color: "var(--color-ink)" }}>
        The store is live —{" "}
        <Link href="/shop" style={{ textDecoration: "underline" }}>
          claim your allocation →
        </Link>
      </p>
    );
  }

  const cells = [
    { label: "DAYS", value: t?.days },
    { label: "HOURS", value: t?.hours },
    { label: "MIN", value: t?.minutes },
    { label: "SEC", value: t?.seconds },
  ];

  return (
    <div style={{ display: "inline-flex" }}>
      {cells.map((c, i) => (
        <div
          key={c.label}
          style={{
            padding: "16px 0",
            width: "88px",
            borderTop: "0.4px solid var(--color-rule)",
            borderBottom: "0.4px solid var(--color-rule)",
            borderLeft: i === 0 ? "0.4px solid var(--color-rule)" : "none",
            borderRight: "0.4px solid var(--color-rule)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "28px",
              fontVariantNumeric: "tabular-nums",
              color: "var(--color-ink)",
              lineHeight: 1,
              marginBottom: "6px",
            }}
          >
            {t ? String(c.value).padStart(2, "0") : "--"}
          </p>
          <p className="mono-label text-[9px]" style={{ color: accent }}>
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function PassView({ pass }: { pass: Pass }) {
  const accent =
    pass.item === "bundle"
      ? curation.accent
      : (products.find((p) => p.id === pass.item)?.accent ?? curation.accent);

  return (
    <div
      className="content-rail section-padding"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <p className="mono-label" style={{ opacity: 0.5, marginBottom: "18px" }}>
        RITUAL PASS · VERIFIED
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(36px, 5vw, 64px)",
          letterSpacing: "-0.03em",
          lineHeight: 0.98,
          color: "var(--color-ink)",
          marginBottom: "20px",
          maxWidth: "640px",
        }}
      >
        Your slot is held, {pass.name.split(" ")[0]}.
      </h1>
      <p
        className="mono-body"
        style={{
          fontSize: "14px",
          lineHeight: 1.7,
          color: "var(--color-ink-muted)",
          maxWidth: "420px",
          marginBottom: "48px",
        }}
      >
        This page is yours alone — the link is your key, so keep it private.
        When the countdown ends, your allocation opens for checkout with your
        pre-launch discount.
      </p>

      <HoloTicket ticket={pass} accent={accent} />

      <p
        className="mono-label"
        style={{
          color: "var(--color-ink)",
          opacity: 0.5,
          marginTop: "56px",
          marginBottom: "16px",
        }}
      >
        LAUNCH IN
      </p>
      <Countdown accent={accent} />

      <p
        className="mono-body"
        style={{
          fontSize: "12px",
          color: "var(--color-ink-faint)",
          marginTop: "32px",
          maxWidth: "360px",
        }}
      >
        Reserved to {pass.email}. Reply to your confirmation email to cancel
        or change flavour.
      </p>
    </div>
  );
}
