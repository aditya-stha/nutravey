"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/* ─── Product data ──────────────────────────────────────────────────────── */
const products = [
  {
    id: "strawberry",
    position: "left" as const,
    name: "Strawberry Surge",
    slug: "strawberry-surge",
    flavour: "Strawberry",
    tagline: "Bold vitality.",
    image: "/mock_strawberry.png",
    accent: "#C52B56",
    cta: "Begin Ritual",
  },
  {
    id: "lychee",
    position: "center" as const,
    name: "Lychee Lush",
    slug: "lychee-lush",
    flavour: "Lychee",
    tagline: "Soft radiance.",
    image: "/mock_lychee.png",
    accent: "#AA4198",
    cta: "Discover Flavour",
  },
  {
    id: "lemon",
    position: "right" as const,
    name: "Lemon Zest",
    slug: "lemon-zest",
    flavour: "Lemon",
    tagline: "Pure clarity.",
    image: "/mock_lemon.png",
    accent: "#FADC33",
    cta: "Explore Ritual",
  },
];

/* Opacity-only entry. Transform is owned by CSS (rotation + stagger), so
   Framer must not touch it. */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function ProductTrio() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "var(--color-surface)",
        position: "relative",
      }}
    >
      {/* Tight squircle clip — clipPathUnits='objectBoundingBox' lets it
          scale to any element. Corners are subtle (~5%): architectural,
          not bubble. */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <clipPath id="nutravey-squircle" clipPathUnits="objectBoundingBox">
            <path d="M 0.05,0 L 0.95,0 C 0.978,0 1,0.022 1,0.05 L 1,0.95 C 1,0.978 0.978,1 0.95,1 L 0.05,1 C 0.022,1 0,0.978 0,0.95 L 0,0.05 C 0,0.022 0.022,0 0.05,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="content-rail"
        style={{ paddingTop: "40px", paddingBottom: "40px" }}
      >
        {/* Section header */}
        <div style={{ marginBottom: "48px" }}>
          <p
            className="mono-label"
            style={{
              color: "var(--color-ink)",
              opacity: 0.42,
              marginBottom: "12px",
            }}
          >
            The Collection · 30 Sachets
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(34px, 4vw, 52px)",
              letterSpacing: "-0.01em",
              lineHeight: 1.0,
              color: "var(--color-ink)",
              maxWidth: "340px",
              margin: 0,
            }}
          >
            Three rituals.
          </h2>
        </div>

        {/* Product grid */}
        <motion.div
          className="showcase-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {products.map((product) => {
            const isHovered = hoveredId === product.id;
            const groupHovered = hoveredId !== null;
            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="product-card"
                data-position={product.position}
                data-self-hovered={isHovered ? "true" : undefined}
                data-group-hovered={groupHovered ? "true" : undefined}
                style={{ "--flavor": product.accent } as CSSProperties}
                onHoverStart={() => setHoveredId(product.id)}
                onHoverEnd={() => setHoveredId(null)}
              >
                {/* Glow — sibling of the squircle so it blooms OUTSIDE the
                    clipped frame. Behind everything via z-index: -1. */}
                <div className="product-glow" aria-hidden="true" />

                {/* Squircle frame — tight clip, transparent bg, image fills. */}
                <div className="product-squircle">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 30vw"
                    priority
                    className="product-squircle-image"
                  />
                </div>

                {/* Meta */}
                <div className="product-meta">
                  <motion.p
                    className="mono-label"
                    style={{
                      color: "var(--color-ink)",
                      marginBottom: "4px",
                    }}
                    animate={{ opacity: isHovered ? 1 : 0.55 }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.flavour}
                  </motion.p>

                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 500,
                      fontSize: "18px",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.1,
                      color: "var(--color-ink)",
                      margin: "0 0 4px",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    className="mono-body"
                    style={{
                      fontSize: "12px",
                      color: "var(--color-ink-faint)",
                      marginBottom: "10px",
                      letterSpacing: "0",
                    }}
                  >
                    {product.tagline}
                  </p>

                  <Link
                    href={`/products/${product.slug}`}
                    style={{ display: "inline-block" }}
                  >
                    <motion.span
                      className="mono-cta"
                      style={{
                        color: "var(--color-ink)",
                        display: "inline-block",
                      }}
                      animate={{
                        x: isHovered ? 5 : 0,
                        opacity: isHovered ? 1 : 0.5,
                      }}
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    >
                      {product.cta} →
                    </motion.span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Scoped layout styles ──────────────────────────────────────── */}
      <style>{`
        .showcase-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
        }

        @media (min-width: 768px) {
          .showcase-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
            align-items: start;
          }
        }

        .product-card {
          position: relative;
          transform-origin: center;
          /* Smaller cards overall — capped width and centred in column. */
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
          width: 100%;
          transition:
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* ── Composition (desktop only) ──────────────────────────────
           Rest: all cards straight, aligned, no transforms. Siblings stay
           put when another card is hovered (no rotation, no translateY)
           so they can't overlap; they just dim and shrink subtly. Only
           the hovered card actually moves. */
        @media (min-width: 768px) {
          /* 1) Rest — straight, normal position */
          .product-card { transform: none; }

          /* 2) Sibling — dim + tiny shrink only. NO rotation, NO lift. */
          .product-card[data-group-hovered="true"] {
            transform: scale(0.96);
            opacity: 0.5;
          }

          /* 3) Self — lift, slight rotation outward, modest scale-up. */
          .product-card[data-position="left"][data-self-hovered="true"] {
            transform: rotate(-3deg) translateY(-12px) scale(1.06);
            opacity: 1;
          }
          .product-card[data-position="center"][data-self-hovered="true"] {
            transform: rotate(0deg) translateY(-14px) scale(1.08);
            opacity: 1;
          }
          .product-card[data-position="right"][data-self-hovered="true"] {
            transform: rotate(3deg) translateY(-12px) scale(1.06);
            opacity: 1;
          }
        }

        /* ── Flavour glow — sibling of the squircle, behind the card.
              More saturated centre + less blur → pronounced bloom that
              clearly breaks outside the squircle. ── */
        .product-glow {
          position: absolute;
          inset: -10%;
          z-index: -1;
          background: radial-gradient(
            ellipse at center,
            var(--flavor) 0%,
            var(--flavor) 18%,
            transparent 70%
          );
          filter: blur(60px);
          opacity: 0;
          transform: scale(0.85);
          transition:
            opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          will-change: opacity, transform;
        }

        .product-card[data-self-hovered="true"] .product-glow,
        .product-card:hover .product-glow {
          opacity: 1;
          transform: scale(1.35);
        }

        /* ── Tight squircle frame ───────────────────────────────────── */
        .product-squircle {
          position: relative;
          aspect-ratio: 4 / 5;
          width: 100%;
          background: transparent;
          clip-path: url(#nutravey-squircle);
          overflow: hidden;
          margin-bottom: 18px;
        }

        /* Image fills the squircle. object-cover prevents the dead
           background space that prompted this refactor. */
        .product-squircle-image {
          object-fit: cover;
          object-position: center;
        }

        .product-meta {
          display: flex;
          flex-direction: column;
        }

        /* Reduced-motion — disable rotation/scale entirely, keep only
           the opacity entry. */
        @media (prefers-reduced-motion: reduce) {
          .product-card,
          .product-card[data-position="left"],
          .product-card[data-position="center"],
          .product-card[data-position="right"],
          .product-card[data-position="left"]:hover,
          .product-card[data-position="center"]:hover,
          .product-card[data-position="right"]:hover {
            transform: none;
            transition: none;
          }
          .product-glow {
            transition: opacity 200ms linear;
          }
          .product-card:hover .product-glow,
          .product-card[data-self-hovered="true"] .product-glow {
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}
