import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { log } from "@/lib/log";

/* ─── Signed order tokens ───────────────────────────────────────────────────
   Same capability-URL model as the Ritual Pass: the orders/create webhook
   signs the order summary into the confirmation-email link, and /order
   verifies + renders it. No database; whoever holds the link sees the
   summary. Uses PASS_SIGNING_SECRET. */

export interface OrderPayload {
  /** Shopify order name, e.g. "#1001". */
  num: string;
  name: string;
  email: string;
  total: string;
  currency: string;
  /** Up to 6 line titles for display. */
  items: string[];
  /** Shopify's live order-status URL (tracking, fulfillment). */
  statusUrl: string;
  ts: number;
}

function secret(): string {
  const s = process.env.PASS_SIGNING_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    log.warn("pass_secret_missing", {
      hint: "set PASS_SIGNING_SECRET — order links are forgeable without it",
    });
  }
  return s || "nutravey-dev-pass-secret";
}

export function signOrder(payload: OrderPayload): string {
  const body = Buffer.from(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(body).digest();
  return `${body.toString("base64url")}.${sig.toString("base64url")}`;
}

export function verifyOrder(token: string): OrderPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  try {
    const body = Buffer.from(token.slice(0, dot), "base64url");
    const got = Buffer.from(token.slice(dot + 1), "base64url");
    const expected = createHmac("sha256", secret()).update(body).digest();
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
      return null;
    }
    const payload = JSON.parse(body.toString()) as OrderPayload;
    // Field check also rejects pass tokens presented as order tokens.
    if (typeof payload.num !== "string" || typeof payload.total !== "string") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
