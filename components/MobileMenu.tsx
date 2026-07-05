"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuProps {
  links: NavLink[];
}

export default function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  /* Each <Link> inside the overlay calls setOpen(false) on click, so no
     pathname-effect is needed to close on navigation. usePathname is still
     read for aria-current on the active link. */

  /* Lock body scroll while open. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ESC to close. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="mobile-menu-trigger"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <BurgerIcon />
      </button>

      {open && (
        <div
          className="mobile-menu-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="mobile-menu-bar">
            <Link
              href="/"
              aria-label="Nutravey — home"
              style={{ color: "var(--color-ink)", lineHeight: 0 }}
              onClick={() => setOpen(false)}
            >
              <Logo style={{ height: "24px" }} />
            </Link>
            <button
              type="button"
              className="mobile-menu-trigger"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="mobile-menu-nav" aria-label="Primary">
            <ul>
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === l.href ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-menu-foot">
            <span
              className="mono-label"
              style={{ color: "var(--color-ink)", opacity: 0.4 }}
            >
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>
      )}

      <style>{`
        .mobile-menu-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          border-radius: var(--radius-canvas);
          padding: 0;
          color: var(--color-ink);
          cursor: pointer;
          line-height: 0;
          transition: opacity 200ms ease;
        }
        .mobile-menu-trigger:hover { opacity: 0.55; }

        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: var(--color-surface);
          display: flex;
          flex-direction: column;
          padding: 0 32px 32px;
          animation: mm-fade 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes mm-fade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-menu-bar {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 0.4px solid var(--color-rule);
        }

        .mobile-menu-nav {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 24px 0;
        }
        .mobile-menu-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
          width: 100%;
        }
        .mobile-menu-nav li {
          border-bottom: 0.4px solid var(--color-rule);
        }
        .mobile-menu-nav a {
          display: block;
          padding: 20px 0;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(32px, 8vw, 48px);
          letter-spacing: -0.02em;
          line-height: 1.05;
          color: var(--color-ink);
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .mobile-menu-nav a:hover {
          opacity: 0.6;
        }
        .mobile-menu-nav a[aria-current="page"] {
          color: var(--color-ink);
        }
        .mobile-menu-nav a[aria-current="page"]::after {
          content: " ·";
          color: var(--color-ink-faint);
        }

        .mobile-menu-foot {
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 0.4px solid var(--color-rule);
        }
      `}</style>
    </>
  );
}

function BurgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="7" x2="17" y2="7" />
      <line x1="3" y1="13" x2="17" y2="13" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" />
      <line x1="15.5" y1="4.5" x2="4.5" y2="15.5" />
    </svg>
  );
}
