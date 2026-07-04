import type { ReactNode } from "react";

/* ─── System page shell ─────────────────────────────────────────────────────
   Shared frame for the 404 / error boundaries. Deliberately dependency-free
   (no framer-motion, no hooks) so it renders in Server Components and inside
   a crashed client boundary alike. Entry motion is a CSS fade-up matching the
   brand's 600ms curve, disabled under prefers-reduced-motion. */

export default function SystemPage({
  eyebrow,
  heading,
  copy,
  children,
}: {
  eyebrow: string;
  heading: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <div className="content-rail section-padding system-page">
      <p className="mono-label system-eyebrow">{eyebrow}</p>
      <h1 className="system-heading">{heading}</h1>
      <p className="mono-body system-copy">{copy}</p>
      {children}
      <style>{`
        .system-page > * {
          opacity: 0;
          animation: system-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .system-page > *:nth-child(2) { animation-delay: 50ms; }
        .system-page > *:nth-child(3) { animation-delay: 100ms; }
        .system-page > *:nth-child(4) { animation-delay: 150ms; }
        @keyframes system-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .system-page > * { animation: none; opacity: 1; }
        }

        .system-eyebrow {
          color: var(--color-ink);
          opacity: 0.5;
          margin-bottom: 18px;
        }
        .system-heading {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(44px, 7vw, 96px);
          letter-spacing: -0.03em;
          line-height: 0.98;
          color: var(--color-ink);
          max-width: 820px;
          margin-bottom: 28px;
        }
        .system-copy {
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-ink-muted);
          max-width: 440px;
          margin-bottom: 56px;
        }

        /* Destination index — set like a supplement-facts panel:
           name left, dose (path) right, hairline rows. */
        .system-index {
          list-style: none;
          margin: 0;
          padding: 0;
          max-width: 560px;
        }
        .system-index li { border-top: 0.4px solid var(--color-rule); }
        .system-index li:last-child { border-bottom: 0.4px solid var(--color-rule); }
        .system-index a {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 24px;
          padding: 18px 0;
          text-decoration: none;
          transition: opacity 200ms ease;
        }
        .system-index a:hover { opacity: 0.55; }
        .system-index .name {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 20px;
          letter-spacing: -0.015em;
          color: var(--color-ink);
        }
        .system-index .path {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.04em;
          color: var(--color-ink-faint);
        }

        .system-actions {
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
        }
        .system-retry {
          display: inline-block;
          padding: 18px 36px;
          background: var(--color-ink);
          color: var(--color-surface);
          border: none;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .system-retry:hover { opacity: 0.88; transform: translateY(-1px); }
        .system-home-link {
          color: var(--color-ink);
          transition: opacity 200ms ease;
        }
        .system-home-link:hover { opacity: 0.6; }
        .system-ref {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--color-ink-faint);
          margin-top: 40px;
        }
      `}</style>
    </div>
  );
}
