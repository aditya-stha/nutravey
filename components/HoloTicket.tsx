"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";

/* ─── Ritual Pass — the reservation artifact ────────────────────────────────
   One card, rendered identically wherever a reservation exists: the shop
   exhibition, the PDP form, the private /pass page, and (as copy) the
   confirmation email. Cyberminimal holo treatment: the iridescent sheen and
   foil badge hue ride the same tilt values as the card itself, so the
   hologram shifts with viewing angle like real foil. */

export interface TicketData {
  id: string;
  name: string;
  email: string;
  flavor: string;
}

export default function HoloTicket({
  ticket,
  accent,
}: {
  ticket: TicketData;
  accent: string;
}) {
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setTilt({
      x: (y / (box.height / 2)) * -12,
      y: (x / (box.width / 2)) * 12,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: reduce ? "none" : "transform 0.15s ease-out",
        width: "100%",
        maxWidth: "340px",
        transformStyle: "preserve-3d",
        backgroundColor: "var(--color-aubergine-deep)",
        color: "var(--color-cream)",
        borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
        boxShadow: `0 0 70px -22px ${accent}`,
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
          background: `linear-gradient(90deg, transparent, rgba(94,240,255,0.5), ${accent}, rgba(255,94,247,0.5), transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
        <div>
          <p className="mono-label text-[8px] text-white/50 tracking-[0.2em] mb-1">
            RITUAL PASS
          </p>
          <p className="font-semibold text-lg tracking-tight">NUTRAVEY</p>
        </div>
        {/* Holo-foil badge: conic border rotates with tilt */}
        <span
          className="mono-label text-[9px] px-2 py-0.5 text-white/90 uppercase"
          style={{
            border: "1px solid transparent",
            backgroundImage: `linear-gradient(var(--color-aubergine-deep), var(--color-aubergine-deep)), conic-gradient(from ${135 + tilt.y * 14}deg, rgba(94,240,255,0.9), ${accent}, rgba(255,94,247,0.9), rgba(160,255,140,0.8), rgba(94,240,255,0.9))`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          VIP PRIORITY
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 mb-8 text-left">
        <div>
          <p className="mono-label text-[8px] text-white/40 mb-0.5">ALLOCATED SLATE</p>
          <p className="font-medium text-[15px]" style={{ color: accent }}>
            {ticket.flavor}
          </p>
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

      {/* Barcode & identifier */}
      <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-auto">
        <div>
          <p className="mono-label text-[8px] text-white/40 mb-0.5">SLOT ID</p>
          <p className="font-mono text-sm tracking-widest text-white/90">{ticket.id}</p>
        </div>
        <svg
          width="84"
          height="24"
          viewBox="0 0 100 24"
          className="text-white/80"
          fill="currentColor"
          aria-hidden="true"
        >
          {[
            [0, 3], [5, 1], [8, 4], [14, 2], [18, 1], [21, 3], [26, 5],
            [33, 1], [36, 2], [40, 4], [46, 1], [49, 3], [54, 6], [62, 2],
            [66, 1], [69, 3], [74, 4], [80, 1], [83, 2], [87, 5], [94, 1], [97, 3],
          ].map(([x, w]) => (
            <rect key={x} x={x} y="0" width={w} height="24" />
          ))}
        </svg>
      </div>
    </div>
  );
}
