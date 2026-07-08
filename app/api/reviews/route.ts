import { NextRequest, NextResponse } from "next/server";
import { reviewEligibility, persistReview } from "@/lib/reviews";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import { log } from "@/lib/log";

// Purchase-gating is the real barrier; this just stops a verified buyer
// from flooding the metaobject store.
const rateLimited = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

/* GET ?product=<slug> → { eligible, reason } for the signed-in customer.
   POST { product, rating, title, body } → creates a VERIFIED review.
   Verification is structural: the session cookie proves the account, the
   account's order history proves the paid + shipped purchase. No purchase,
   no review — that's the bot gate. */

export async function GET(request: NextRequest) {
  const product = request.nextUrl.searchParams.get("product") ?? "";
  const result = await reviewEligibility(product);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many reviews — try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: {
    product?: unknown;
    rating?: unknown;
    title?: unknown;
    body?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const product = typeof body.product === "string" ? body.product : "";
  const rating = Math.round(Number(body.rating));
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
  const text =
    typeof body.body === "string" ? body.body.trim().slice(0, 800) : "";

  if (!product || !text || rating < 1 || rating > 5) {
    return NextResponse.json(
      { ok: false, error: "Add a rating and a few words." },
      { status: 400 },
    );
  }

  const eligibility = await reviewEligibility(product);
  if (!eligibility.eligible) {
    return NextResponse.json(
      { ok: false, error: eligibility.reason },
      { status: 403 },
    );
  }

  const persisted = await persistReview({
    product,
    rating,
    title,
    body: text,
    author: eligibility.author ?? "Verified customer",
    date: new Date().toISOString().slice(0, 10),
    verified: true,
  });

  log.info("review_submitted", { product, rating, persisted });
  return NextResponse.json({
    ok: true,
    // Honest state: without Admin credentials the review is logged for
    // manual publication rather than appearing instantly.
    live: persisted,
  });
}
