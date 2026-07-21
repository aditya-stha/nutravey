"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";
import CartLink from "@/components/cart/CartLink";
import { usePreLaunch } from "@/components/providers/PreLaunchProvider";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Discovery", href: "/discovery" },
  { label: "About", href: "/about" },
  { label: "Standards", href: "/standards" },
];

export default function Header() {
  const isPreLaunch = usePreLaunch();

  /* Commerce entries join the nav in live mode only — during pre-launch the
     cart is offline and accounts are a stub, so linking them is a dead end. */
  const commerceLinks = isPreLaunch
    ? []
    : [{ label: "Account", href: "/account" }];

  return (
    <header
      className="site-header"
      style={{ backgroundColor: "var(--color-surface-header)" }}
    >
      <div
        className="content-rail flex items-center justify-between"
        style={{ height: "64px" }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{ color: "var(--color-ink)", lineHeight: 0 }}
          aria-label="Nutravey — home"
        >
          <Logo style={{ height: "24px" }} />
        </Link>

        {/* Desktop: nav + theme toggle */}
        <div className="site-header-desktop">
          <nav aria-label="Primary navigation">
            <ul
              className="flex items-center"
              style={{ gap: "40px", listStyle: "none", margin: 0, padding: 0 }}
            >
              {[...navLinks, ...commerceLinks].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="mono-cta transition-opacity duration-200 hover:opacity-50"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {!isPreLaunch && (
                <li>
                  <CartLink />
                </li>
              )}
            </ul>
          </nav>
          <ThemeToggle />
        </div>

        {/* Mobile: hamburger trigger (overlay rendered conditionally) */}
        <div className="site-header-mobile">
          <MobileMenu
            links={[
              ...navLinks,
              ...commerceLinks,
              ...(isPreLaunch ? [] : [{ label: "Cart", href: "/cart" }]),
            ]}
          />
        </div>
      </div>

      {/* Hairline bottom border */}
      <div
        style={{
          height: "0.4px",
          backgroundColor: "var(--color-rule)",
        }}
      />

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
        }

        /* Mobile-first: hide desktop cluster, show mobile trigger */
        .site-header-desktop { display: none; }
        .site-header-mobile { display: inline-flex; align-items: center; }

        @media (min-width: 768px) {
          .site-header-desktop {
            display: flex;
            align-items: center;
            gap: 32px;
          }
          .site-header-mobile { display: none; }
        }
      `}</style>
    </header>
  );
}
