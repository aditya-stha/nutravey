import Link from "next/link";
import Logo from "@/components/Logo";

const leftLinks = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Standards", href: "/standards" },
];

const rightLinks = [
  { label: "Discovery", href: "/discovery" },
  { label: "The Curation", href: "/products/the-curation" },
  { label: "Cart", href: "/cart" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--color-surface-footer)" }}>
      {/* Hairline top border */}
      <div
        style={{
          height: "0.4px",
          backgroundColor: "rgba(250, 250, 250, 0.15)",
        }}
      />

      <div
        className="content-rail site-footer-rail"
        style={{ paddingTop: "56px", paddingBottom: "32px" }}
      >
        {/* Wordmark — large on mobile, kept centered between the link columns on desktop */}
        <div className="site-footer-mark">
          <Link
            href="/"
            style={{ color: "var(--color-cream)", lineHeight: 0 }}
            aria-label="Nutravey — home"
          >
            <Logo style={{ height: "clamp(40px, 6vw, 64px)" }} />
          </Link>
        </div>

        {/* Link columns */}
        <ul className="site-footer-links site-footer-links-left">
          {leftLinks.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="mono-cta transition-opacity duration-200 hover:opacity-100"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="site-footer-links site-footer-links-right">
          {rightLinks.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="mono-cta transition-opacity duration-200 hover:opacity-100"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Copyright */}
        <div className="site-footer-copy">
          <span
            className="mono-label"
            style={{ color: "rgba(250, 250, 250, 0.3)", fontSize: "10px" }}
          >
            © 2026 Nutravey. All rights reserved.
          </span>
        </div>
      </div>

      <style>{`
        /* Mobile-first: wordmark top, two columns of links, copyright bottom. */
        .site-footer-rail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px 24px;
          align-items: start;
        }

        .site-footer-mark {
          grid-column: 1 / -1;
          margin-bottom: 8px;
        }

        .site-footer-links {
          display: flex;
          flex-direction: column;
          gap: 14px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .site-footer-links a {
          color: rgba(250, 250, 250, 0.55);
          font-size: 11px;
        }
        .site-footer-links a:hover { color: rgba(250, 250, 250, 1); }

        .site-footer-copy {
          grid-column: 1 / -1;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 0.4px solid rgba(250, 250, 250, 0.1);
          text-align: center;
        }

        /* Desktop: three-column row with wordmark centered between link lists. */
        @media (min-width: 768px) {
          .site-footer-rail {
            grid-template-columns: 1fr auto 1fr;
            grid-template-areas:
              "left mark right"
              "copy copy copy";
            gap: 48px;
            align-items: center;
          }
          .site-footer-mark {
            grid-area: mark;
            margin-bottom: 0;
            justify-self: center;
          }
          .site-footer-links-left {
            grid-area: left;
            justify-self: start;
          }
          .site-footer-links-right {
            grid-area: right;
            justify-self: end;
            align-items: flex-end;
          }
          .site-footer-copy {
            grid-area: copy;
            margin-top: 48px;
          }
        }
      `}</style>
    </footer>
  );
}
