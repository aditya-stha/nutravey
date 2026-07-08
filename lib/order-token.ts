import "server-only";
import { signToken, verifyToken } from "@/lib/signed-token";

/* ─── Signed order tokens ───────────────────────────────────────────────────
   Same capability-URL model as the Ritual Pass: the orders/create webhook
   signs the order summary into the confirmation-email link, and /order
   verifies + renders it. See lib/signed-token.ts — production requires
   PASS_SIGNING_SECRET and fails closed without it. */

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

/* Field check also rejects pass tokens presented as order tokens. */
function isOrderPayload(p: unknown): p is OrderPayload {
  const o = p as Partial<OrderPayload> | null;
  return (
    typeof o === "object" &&
    o !== null &&
    typeof o.num === "string" &&
    typeof o.total === "string" &&
    Array.isArray(o.items)
  );
}

export function signOrder(payload: OrderPayload): string {
  return signToken(payload);
}

export function verifyOrder(token: string): OrderPayload | null {
  return verifyToken(token, isOrderPayload);
}
