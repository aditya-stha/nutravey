import { NextRequest, NextResponse } from "next/server";
import { SHOPIFY_STORE_DOMAIN } from "@/lib/shopify-config";
import { getAdminToken, createOrTagCustomer } from "@/lib/shopify-admin";
import { products } from "@/lib/products";
import { signPass } from "@/lib/pass";
import { createDiscountCode, FRIEND_PCT } from "@/lib/referral";
import { sendPassEmail } from "@/lib/email";
import { log } from "@/lib/log";

/* ─── Pre-launch reservation endpoint ───────────────────────────────────────
   Public + unauthenticated, so defense is layered: strict validation, a
   honeypot field, per-IP rate limiting, and (when keys are present)
   Cloudflare Turnstile verification. Accepted leads become Shopify
   customers tagged `pre-launch` — the launch-day email list is then just a
   customer segment, no separate database to run. */

const RATE_LIMIT = 5; // submissions per IP…
const RATE_WINDOW_MS = 10 * 60 * 1000; // …per 10 minutes

/* Per-instance sliding window. Serverless instances don't share it, which is
   acceptable at this traffic level — Turnstile is the stronger gate. */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear(); // crude memory bound
  return recent.length > RATE_LIMIT;
}

const VALID_ITEMS = new Set([...products.map((p) => p.id), "bundle"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface WaitlistBody {
  name?: unknown;
  email?: unknown;
  item?: unknown;
  turnstileToken?: unknown;
  company?: unknown; // honeypot — humans never see this field
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — gate disabled
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    },
  );
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}

/** Creates (or re-tags) the lead as a Shopify customer. Returns false only
 *  on hard failure; "email already taken" counts as success.
 *  Tag scheme (each independently segmentable in Shopify admin):
 *    pre-launch · interested · flavour-<flavour> · selection-<item> */
async function createShopifyLead(
  name: string,
  email: string,
  item: string,
  flavour: string,
  slotId: string,
): Promise<boolean> {
  const adminToken = await getAdminToken();
  if (!adminToken || !SHOPIFY_STORE_DOMAIN) {
    // Not configured yet (dev / pre-credentials). Log the lead so it is at
    // least recoverable from logs, and flag loudly in production.
    log.warn("waitlist_lead_unpersisted", { email, item });
    return true;
  }

  const ok = await createOrTagCustomer({
    firstName: name,
    email,
    tags: [
      "pre-launch",
      "interested",
      `flavour-${flavour.toLowerCase().replace(/\s+/g, "-")}`,
      `selection-${item}`,
      // Links this customer to their slot/referral code for webhook rewards.
      `slot-${slotId}`,
    ],
    note: `Pre-launch reservation: ${flavour} (${item})`,
  });
  if (!ok) log.error("waitlist_shopify_error", { email, item });
  return ok;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: WaitlistBody;
  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  // Honeypot: silently accept so bots don't learn they were caught.
  if (typeof body.company === "string" && body.company.length > 0) {
    log.warn("waitlist_honeypot", { ip });
    return NextResponse.json({ ok: true, id: "NVY-OK" });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const item = typeof body.item === "string" ? body.item : "";

  if (
    name.length < 1 ||
    name.length > 120 ||
    !EMAIL_RE.test(email) ||
    email.length > 254 ||
    !VALID_ITEMS.has(item)
  ) {
    return NextResponse.json(
      { ok: false, error: "Check your name and email and try again." },
      { status: 400 },
    );
  }

  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (!(await verifyTurnstile(token, ip))) {
    return NextResponse.json(
      { ok: false, error: "Verification failed. Reload the page and retry." },
      { status: 403 },
    );
  }

  const flavor =
    item === "bundle"
      ? "The Curation Box"
      : (products.find((p) => p.id === item)?.name ?? "Ritual Set");

  const id = `NVY-${item.slice(0, 2).toUpperCase()}-${Math.floor(
    10000 + Math.random() * 90000,
  )}`;

  /* Persistence failure is our ops problem, never the customer's: the pass
     still issues and the lead is recoverable from this log line. */
  const persisted = await createShopifyLead(name, email, item, flavor, id);
  if (!persisted) {
    log.warn("waitlist_lead_unpersisted", { email, item, id });
  }

  // The slot ID doubles as a shareable referral code (friends save FRIEND_PCT%).
  // Env-gated inside; failure is non-fatal — the reservation stands.
  await createDiscountCode({
    code: id,
    title: `Referral — ${id}`,
    percent: FRIEND_PCT,
  });

  // Private capability URL: the signed payload *is* the record.
  const passToken = signPass({ id, name, email, item, flavor, ts: Date.now() });
  const passUrl = `${request.nextUrl.origin}/pass?t=${passToken}`;

  await sendPassEmail({ to: email, name, flavor, id, passUrl });

  log.info("waitlist_signup", { item, id });
  return NextResponse.json({ ok: true, id, passUrl });
}
