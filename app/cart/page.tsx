"use client";

/* ─── Cart ──────────────────────────────────────────────────────────────────
   State lives entirely in Hydrogen's `useCart` (backed by the Storefront Cart
   API + localStorage). No local/global store: line quantities, removal,
   totals, and the checkout URL all come from the hook. Must render inside
   <CartProvider> (mounted in the root layout). */

import { unlockAndCheckout } from "@/lib/unlock-store";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart, Money, Image } from "@shopify/hydrogen-react";
import type {
  CartLine,
  ComponentizableCartLine,
  ProductVariant,
} from "@shopify/hydrogen-react/storefront-api-types";
import { isShopifyConfigured, isPreLaunch } from "@/lib/shopify-config";
import { track } from "@/lib/analytics";

type Line = CartLine | ComponentizableCartLine;



export default function CartPage() {
  const {
    lines,
    cost,
    checkoutUrl,
    totalQuantity,
    status,
    linesRemove,
    linesUpdate,
    discountCodes,
    discountCodesUpdate,
  } = useCart();

   useEffect(() => {
    if (checkoutUrl) console.log("Checkout URL:", checkoutUrl);
  }, [checkoutUrl]);

  /* Referral auto-apply: /r/<code> stores the code in a cookie; once the
     cart exists, apply it exactly once. Shopify validates the code — an
     invalid one simply comes back inapplicable. */
  const refApplied = useRef(false);
  const hasLines = (lines ?? []).length > 0;
  useEffect(() => {
    if (refApplied.current || !hasLines) return;
    const ref = document.cookie
      .split("; ")
      .find((c) => c.startsWith("nvy-ref="))
      ?.split("=")[1];
    if (!ref) return;
    const active = (discountCodes ?? []).map((d) => d?.code);
    if (!active.includes(ref)) {
      discountCodesUpdate([...(active.filter(Boolean) as string[]), ref]);
    }
    refApplied.current = true;
  }, [hasLines, discountCodes, discountCodesUpdate]);

  const cartLines = (lines ?? []) as Line[];
  const busy = status === "creating" || status === "updating";

  if (isPreLaunch) {
    return (
      <CartShell heading="Cart">
        <p className="mono-body cart-empty-copy">
          Checkout is offline during our pre-launch reservation phase.
          You can secure your priority allocation slot for free.
        </p>
        <Link href="/shop" className="cart-shop-link mono-cta" style={{ display: "inline-block", marginTop: "24px" }}>
          Go to Reservations →
        </Link>
      </CartShell>
    );
  }

  if (!isShopifyConfigured) {
    return (
      <CartShell heading="Cart">
        <p className="mono-body cart-empty-copy">
          The storefront isn&rsquo;t connected yet. Add your Shopify credentials
          to <code>.env.local</code> (see <code>.env.local.example</code>) to
          enable the cart and checkout.
        </p>
      </CartShell>
    );
  }


  if (cartLines.length === 0) {
    return (
      <CartShell heading="Cart">
        <p className="mono-body cart-empty-copy">
          Your cart is empty.
        </p>
        <Link href="/shop" className="cart-shop-link mono-cta">
          Browse the collection →
        </Link>
      </CartShell>
    );
  }

  return (
    <CartShell heading="Cart" count={totalQuantity ?? 0}>
      <ul className="cart-lines">
        {cartLines.map((line) => {
          const merchandise = line.merchandise as ProductVariant | undefined;
          const image = merchandise?.image;
          return (
            <li key={line.id} className="cart-line">
              <div className="cart-line-visual">
                {image && (
                  <Image
                    data={image}
                    alt={image.altText ?? merchandise?.product?.title ?? ""}
                    width={88}
                    height={110}
                    sizes="88px"
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                )}
              </div>

              <div className="cart-line-meta">
                <p
                  className="mono-label"
                  style={{ color: "var(--color-ink-faint)", marginBottom: "4px" }}
                >
                  {merchandise?.title && merchandise.title !== "Default Title"
                    ? merchandise.title
                    : "One Month"}
                </p>
                <h2 className="cart-line-name">
                  {merchandise?.product?.title ?? "Product"}
                </h2>
                <div className="cart-line-qty" aria-label="Quantity">
                  <button
                    type="button"
                    className="cart-qty-btn mono-cta"
                    aria-label="Decrease quantity"
                    disabled={busy || (line.quantity ?? 1) <= 1}
                    onClick={() =>
                      line.id &&
                      linesUpdate([
                        { id: line.id, quantity: (line.quantity ?? 1) - 1 },
                      ])
                    }
                  >
                    −
                  </button>
                  <span className="mono-body" aria-live="polite" style={{ fontSize: "13px", minWidth: "24px", textAlign: "center" }}>
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    className="cart-qty-btn mono-cta"
                    aria-label="Increase quantity"
                    disabled={busy || (line.quantity ?? 1) >= 9}
                    onClick={() =>
                      line.id &&
                      linesUpdate([
                        { id: line.id, quantity: (line.quantity ?? 1) + 1 },
                      ])
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-line-right">
                {line.cost?.totalAmount && (
                  <span className="cart-line-price">
                    <Money data={line.cost.totalAmount} />
                  </span>
                )}
                <button
                  type="button"
                  className="cart-line-remove mono-cta"
                  onClick={() => line.id && linesRemove([line.id])}
                  disabled={busy}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span className="mono-label" style={{ color: "var(--color-ink-muted)" }}>
            Subtotal
          </span>
          {cost?.subtotalAmount && (
            <span className="cart-summary-total">
              <Money data={cost.subtotalAmount} />
            </span>
          )}
        </div>
        {(discountCodes ?? []).filter((d) => d?.applicable).length > 0 && (
          <div className="cart-summary-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <span className="mono-label" style={{ color: "var(--color-ink-muted)" }}>
              Code applied
            </span>
            <span className="mono-cta" style={{ color: "var(--color-strawberry)" }}>
              {(discountCodes ?? [])
                .filter((d) => d?.applicable)
                .map((d) => d?.code)
                .join(" · ")}
            </span>
          </div>
        )}
        {cost?.totalAmount &&
          cost?.subtotalAmount &&
          Number(cost.totalAmount.amount) < Number(cost.subtotalAmount.amount) && (
            <div className="cart-summary-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <span className="mono-label" style={{ color: "var(--color-ink-muted)" }}>
                After discounts
              </span>
              <span className="cart-summary-total" style={{ fontSize: "18px" }}>
                <Money data={cost.totalAmount} />
              </span>
            </div>
          )}
        <p
          className="mono-body"
          style={{
            fontSize: "11px",
            color: "var(--color-ink-faint)",
            marginBottom: "24px",
            marginTop: "12px",
          }}
        >
          Taxes and shipping calculated at checkout.
        </p>

        {checkoutUrl && (
          <a
          href={checkoutUrl}
          className="cart-checkout mono-cta"
          aria-busy={busy}
          onClick={async (e) => {
            e.preventDefault();
            track("begin_checkout", {
              value: Number(cost?.subtotalAmount?.amount ?? 0),
              currency: cost?.subtotalAmount?.currencyCode ?? "USD",
              items: totalQuantity ?? 0,
              source: "cart",
            });
            await unlockAndCheckout(checkoutUrl);
          }}
          >
          {busy ? "Updating…" : "Checkout →"}
          </a>
       )}

        <Link href="/shop" className="cart-continue mono-cta">
          Continue shopping
        </Link>
      </div>
    </CartShell>
  );
}

function CartShell({
  heading,
  count,
  children,
}: {
  heading: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="content-rail section-padding">
      <p
        className="mono-label"
        style={{ color: "var(--color-ink)", opacity: 0.5, marginBottom: "12px" }}
      >
        {count ? `${count} item${count === 1 ? "" : "s"}` : " "}
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(40px, 6vw, 72px)",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: "var(--color-ink)",
          marginBottom: "40px",
        }}
      >
        {heading}
      </h1>
      {children}
      <CartStyles />
    </div>
  );
}

function CartStyles() {
  return (
    <style>{`
      .cart-empty-copy {
        font-size: 15px;
        line-height: 1.65;
        color: var(--color-ink-muted);
        max-width: 420px;
        margin-bottom: 24px;
      }
      .cart-shop-link, .cart-continue {
        display: inline-block;
        color: var(--color-ink);
        transition: opacity 200ms ease;
      }
      .cart-shop-link:hover, .cart-continue:hover { opacity: 0.6; }

      .cart-lines { list-style: none; margin: 0 0 48px; padding: 0; }
      .cart-line {
        display: grid;
        grid-template-columns: 88px 1fr auto;
        gap: 24px;
        align-items: center;
        padding: 24px 0;
        border-top: 0.4px solid var(--color-rule);
      }
      .cart-line:last-child { border-bottom: 0.4px solid var(--color-rule); }

      .cart-line-visual {
        position: relative;
        width: 88px;
        height: 110px;
        background: var(--color-surface);
        overflow: hidden;
        border-radius: var(--radius-canvas);
      }

      .cart-line-name {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 22px;
        letter-spacing: -0.015em;
        color: var(--color-ink);
        margin: 0 0 6px;
      }

      .cart-line-qty {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: 0.4px solid var(--color-rule);
        border-radius: var(--radius-canvas);
        padding: 2px 6px;
      }
      .cart-qty-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 8px;
        color: var(--color-ink);
        transition: opacity 200ms ease;
      }
      .cart-qty-btn:hover:not(:disabled) { opacity: 0.5; }
      .cart-qty-btn:disabled { opacity: 0.25; cursor: not-allowed; }

      .cart-line-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }
      .cart-line-price {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 18px;
        color: var(--color-ink);
      }
      .cart-line-remove {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        color: var(--color-ink-faint);
        transition: opacity 200ms ease;
      }
      .cart-line-remove:hover:not(:disabled) { opacity: 0.6; }
      .cart-line-remove:disabled { opacity: 0.4; cursor: not-allowed; }

      .cart-summary { max-width: 420px; margin-left: auto; }
      .cart-summary-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding-bottom: 12px;
        margin-bottom: 8px;
        border-bottom: 0.4px solid var(--color-rule);
      }
      .cart-summary-total {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: 24px;
        color: var(--color-ink);
      }

      .cart-checkout {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 18px 28px;
        margin-bottom: 16px;
        background: var(--color-ink);
        color: var(--color-surface);
        letter-spacing: 0.08em;
        border-radius: var(--radius-canvas);
        transition: opacity 200ms ease, transform 200ms ease;
      }
      .cart-checkout:hover { opacity: 0.88; transform: translateY(-1px); }

      .cart-continue { text-align: center; width: 100%; }
    `}</style>
  );
}
