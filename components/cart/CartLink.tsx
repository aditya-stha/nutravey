"use client";

/* Header cart link. Reads live cart state from the Hydrogen `useCart` hook and
   shows a count badge. Must render inside <CartProvider> (mounted in the root
   layout). */

import Link from "next/link";
import { useCart } from "@shopify/hydrogen-react";

export default function CartLink() {
  const { totalQuantity } = useCart();
  const count = totalQuantity ?? 0;

  return (
    <Link
      href="/cart"
      className="mono-cta transition-opacity duration-200 hover:opacity-50"
      style={{ color: "var(--color-ink)", position: "relative" }}
      aria-label={`Cart${count ? `, ${count} item${count === 1 ? "" : "s"}` : ", empty"}`}
    >
      Cart
      {count > 0 && (
        <span
          aria-hidden="true"
          style={{
            marginLeft: "6px",
            fontSize: "11px",
            opacity: 0.6,
          }}
        >
          ({count})
        </span>
      )}
    </Link>
  );
}
