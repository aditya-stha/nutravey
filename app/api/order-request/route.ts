import { NextRequest, NextResponse } from "next/server";
import { getCustomer } from "@/lib/customer-account";
import { log } from "@/lib/log";

/* ─── Order requests (cancel / change) ──────────────────────────────────────
   Self-serve order edits aren't exposed to headless customers by Shopify, so
   requests flow as a verified pipeline instead: signed-in customer → this
   route → email to the store inbox (Resend) + structured log. The session
   cookie is the auth; the order must belong to that customer. */

export async function POST(request: NextRequest) {
  const customer = await getCustomer();
  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "Sign in to manage your orders." },
      { status: 401 },
    );
  }

  let body: { order?: unknown; kind?: unknown; message?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const order = typeof body.order === "string" ? body.order.trim() : "";
  const kind = body.kind === "cancel" ? "cancel" : body.kind === "change" ? "change" : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";

  if (!order || !kind) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // The order must actually belong to the signed-in customer.
  if (!customer.orders.some((o) => o.name === order)) {
    return NextResponse.json(
      { ok: false, error: "That order isn't on this account." },
      { status: 403 },
    );
  }

  log.info("order_request", { order, kind, email: customer.email });

  // Deliver to the store inbox when Resend is configured.
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const inbox = process.env.ORDER_REQUEST_EMAIL || from;
  if (key && from && inbox) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: inbox,
        reply_to: customer.email,
        subject: `[${kind.toUpperCase()} REQUEST] Order ${order}`,
        text: `Customer: ${customer.firstName} <${customer.email}>\nOrder: ${order}\nRequest: ${kind}\n\n${message || "(no message)"}\n\nVerified via customer account session.`,
      }),
    }).catch((err) => log.error("order_request_email_failed", { message: String(err) }));
  } else {
    log.warn("order_request_email_skipped", { order, kind });
  }

  return NextResponse.json({ ok: true });
}
