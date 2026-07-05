import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { products } from "@/lib/products";
import { log } from "@/lib/log";

/* ─── Shopify webhook receiver ──────────────────────────────────────────────
   The bridge from "something happened in the back office" to the storefront:
   - orders/create   → first-party purchase event (ad-blocker-proof — the
                       browser never has to report the sale).
   - products/update → instant ISR revalidation, so price/stock edits in
                       admin reach the live PDP in seconds, not an hour.
   Register in Shopify admin → Settings → Notifications → Webhooks, pointing
   at /api/webhooks/shopify, and put the signing secret Shopify shows you in
   SHOPIFY_WEBHOOK_SECRET. Every request is HMAC-verified; forged events
   are rejected. */

const KNOWN_SLUGS = new Set<string>(products.map((p) => p.slug));

function verifySignature(raw: string, header: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const digest = createHmac("sha256", secret).update(raw, "utf8").digest();
  let given: Buffer;
  try {
    given = Buffer.from(header, "base64");
  } catch {
    return false;
  }
  return digest.length === given.length && timingSafeEqual(digest, given);
}

export async function POST(request: NextRequest) {
  if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
    log.warn("webhook_unconfigured", {
      hint: "set SHOPIFY_WEBHOOK_SECRET to enable webhook processing",
    });
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-shopify-hmac-sha256"))) {
    log.warn("webhook_bad_signature", {
      topic: request.headers.get("x-shopify-topic"),
    });
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  switch (topic) {
    case "orders/create": {
      const lineItems = Array.isArray(payload.line_items)
        ? (payload.line_items as Array<{ quantity?: number }>)
        : [];
      // The server-side purchase record — GA4's client event misses the
      // ~25% of buyers running ad blockers; this line never does.
      log.info("purchase", {
        orderId: payload.id,
        value: payload.total_price,
        currency: payload.currency,
        items: lineItems.reduce((n, li) => n + (li.quantity ?? 0), 0),
      });
      break;
    }

    case "products/update":
    case "products/create": {
      const handle = typeof payload.handle === "string" ? payload.handle : "";
      if (KNOWN_SLUGS.has(handle)) {
        revalidatePath(`/products/${handle}`);
      }
      revalidatePath("/shop");
      log.info("webhook_revalidated", { topic, handle });
      break;
    }

    default:
      log.info("webhook_ignored", { topic });
  }

  return NextResponse.json({ ok: true });
}
