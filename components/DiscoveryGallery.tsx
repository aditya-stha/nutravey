"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface GalleryCard {
  src: string;
  alt: string;
  label: string;        // strip text on the card
  title: string;        // modal title
  description: string;  // modal one-liner
  x: string;
  y: string;
  rotate: string;
  z: number;
}

/* Six brand-story images. */
const cards: GalleryCard[] = [
  {
    src: "/images/gallery/moment-01.webp",
    alt: "Brand moment one",
    label: "MOMENT 01",
    title: "THE FIRST POUR",
    description: "Where the ritual begins.",
    x: "-700px",
    y: "100px",
    rotate: "-22deg",
    z: 7,
  },
  {
    src: "/images/gallery/moment-02.webp",
    alt: "Brand moment two",
    label: "MOMENT 02",
    title: "THE MORNING LIGHT",
    description: "Before the world catches up.",
    x: "-400px",
    y: "44px",
    rotate: "-13deg",
    z: 8,
  },
  {
    src: "/images/gallery/moment-03.webp",
    alt: "Brand moment three",
    label: "MOMENT 03",
    title: "THE QUIET HOUR",
    description: "Composed for the middle of the day.",
    x: "-130px",
    y: "8px",
    rotate: "-4deg",
    z: 9,
  },
  {
    src: "/images/gallery/moment-04.webp",
    alt: "Brand moment four",
    label: "MOMENT 04",
    title: "THE BRIGHT NOTE",
    description: "Citrus, mineral, clarity.",
    x: "130px",
    y: "8px",
    rotate: "4deg",
    z: 9,
  },
  {
    src: "/images/gallery/moment-05.webp",
    alt: "Brand moment five",
    label: "MOMENT 05",
    title: "THE EVENING SET",
    description: "The closing curve of the day.",
    x: "400px",
    y: "44px",
    rotate: "13deg",
    z: 8,
  },
  {
    src: "/images/gallery/moment-06.webp",
    alt: "Brand moment six",
    label: "MOMENT 06",
    title: "THE STILL FRAME",
    description: "Held — without strain.",
    x: "700px",
    y: "100px",
    rotate: "22deg",
    z: 7,
  },
];

export default function DiscoveryGallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    // The close button is the dialog's only focusable element, so focusing
    // it on open and pinning Tab to it is a complete focus trap.
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus(); // hand focus back to the opening card
    };
  }, [openIndex]);

  const active = openIndex !== null ? cards[openIndex] : null;

  return (
    <section className="gallery-section">
      <div className="arc-container">
        <div className="arc-stage">
          {cards.map((c, i) => (
            <button
              key={i}
              type="button"
              className="gcard"
              style={
                {
                  "--card-x": c.x,
                  "--card-y": c.y,
                  "--card-r": c.rotate,
                  zIndex: c.z,
                } as CSSProperties
              }
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setOpenIndex(i);
              }}
              aria-label={`Open ${c.title}`}
            >
              <Image src={c.src} alt={c.alt} width={480} height={600} sizes="180px" />
              <span className="gcard-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-copy">
        <p className="gallery-tag">BRAND STORIES</p>
        <h2 className="gallery-headline">
          STORIES<br />WORTH SEEING.
        </h2>
        <p className="gallery-body">
          A visual chronicle of the ritual — six moments captured between
          the first pour and the last quiet breath of the day.
        </p>
        <Link href="/shop" className="gallery-cta">
          EXPLORE THE COLLECTION &rarr;
        </Link>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="gallery-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setOpenIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
          >
            <motion.div
              className="gallery-modal"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={active.src}
                alt={active.alt}
                width={1200}
                height={1500}
                sizes="(max-width: 648px) 100vw, 600px"
                className="gallery-image"
              />
              <div className="gallery-meta">
                <h3 className="gallery-title">{active.title}</h3>
                <p className="gallery-desc">{active.description}</p>
              </div>
              <button
                type="button"
                ref={closeRef}
                className="gallery-close"
                onClick={() => setOpenIndex(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .gallery-section {
          background: var(--color-surface);
          overflow: hidden;
          padding: 80px 0 100px;
        }

        .arc-container {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-bottom: 40px;
        }

        .arc-stage {
          position: relative;
          width: 100%;
          max-width: 1400px;
          height: 380px;
        }

        .gcard {
          position: absolute;
          left: 50%;
          top: 0;
          width: 180px;
          height: 260px;
          border-radius: 12px;
          overflow: hidden;
          background: #1a0a12;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          padding: 0;
          border: 0;
          font: inherit;
          color: inherit;
          appearance: none;
          transform:
            translateX(calc(-50% + var(--card-x)))
            translateY(var(--card-y))
            rotate(var(--card-r));
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .gcard:hover {
          transform:
            translateX(calc(-50% + var(--card-x)))
            translateY(calc(var(--card-y) - 12px))
            rotate(var(--card-r))
            scale(1.06);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        .gcard:focus-visible {
          outline: 2px solid var(--color-ink);
          outline-offset: 4px;
        }

        .gcard img {
          width: 100%;
          height: calc(100% - 36px);
          object-fit: cover;
          display: block;
        }

        .gcard-label {
          display: block;
          height: 36px;
          line-height: 36px;
          background: #1a0a12;
          color: #f5ebe0;
          text-align: center;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ── Text block ─────────────────────────────────────── */
        .gallery-copy {
          padding: 24px 80px 0;
        }

        .gallery-tag {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--color-ink) 50%, transparent);
          margin: 0 0 24px;
        }

        .gallery-headline {
          font-family: var(--font-display);
          font-size: clamp(52px, 8vw, 130px);
          font-weight: 800;
          color: var(--color-ink);
          text-transform: uppercase;
          line-height: 0.92;
          letter-spacing: -0.02em;
          margin: 0 0 24px;
        }

        .gallery-body {
          font-family: var(--font-mono);
          font-size: 15px;
          color: color-mix(in srgb, var(--color-ink) 65%, transparent);
          max-width: 480px;
          line-height: 1.65;
          margin: 0 0 28px;
        }

        .gallery-cta {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 13px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--color-ink) 75%, transparent);
          text-decoration: none;
          border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 35%, transparent);
          padding-bottom: 3px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .gallery-cta:hover {
          color: var(--color-ink);
          border-color: var(--color-ink);
        }

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 1100px) {
          .gcard {
            width: 150px;
            height: 220px;
          }
          .arc-stage { height: 340px; }
        }

        @media (max-width: 768px) {
          .gallery-section { padding: 60px 0 80px; }
          .gallery-copy { padding: 24px 24px 0; }
          .gcard {
            width: 120px;
            height: 180px;
          }
          .gcard-label {
            height: 30px;
            line-height: 30px;
            font-size: 8px;
          }
          .gcard img { height: calc(100% - 30px); }
          .arc-stage { height: 280px; }
        }

        /* ── Lightbox ───────────────────────────────────────── */
        .gallery-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(10, 5, 10, 0.85);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          cursor: zoom-out;
        }

        .gallery-modal {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          max-width: 600px;
          width: 100%;
          cursor: default;
        }

        .gallery-image {
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          object-fit: cover;
          border-radius: 16px;
          display: block;
        }

        .gallery-meta {
          text-align: center;
          padding: 0 8px;
        }
        .gallery-title {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(28px, 4vw, 42px);
          letter-spacing: -0.015em;
          line-height: 1.0;
          color: #f5ebe0;
          margin: 0 0 12px;
          text-transform: uppercase;
        }
        .gallery-desc {
          font-family: var(--font-mono);
          font-size: 14px;
          color: rgba(245, 235, 224, 0.65);
          margin: 0;
        }

        .gallery-close {
          position: absolute;
          top: -16px;
          right: -16px;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid rgba(245, 235, 224, 0.3);
          background: rgba(26, 10, 18, 0.8);
          color: #f5ebe0;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .gallery-close:hover {
          background: rgba(26, 10, 18, 1);
          border-color: rgba(245, 235, 224, 0.6);
        }
      `}</style>
    </section>
  );
}
