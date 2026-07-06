import { NextRequest, NextResponse } from "next/server";
import { REFERRAL_CODE_RE } from "@/lib/referral";

/* ─── Referral landing — /r/NVY-XX-12345 ────────────────────────────────────
   The shareable form of a referral code. Stores it in a cookie (the cart
   auto-applies it at checkout time) and forwards to the shop. Invalid
   shapes just forward without a cookie — no error surface for guessers. */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const code = decodeURIComponent((await params).code).trim().toUpperCase();
  const res = NextResponse.redirect(new URL("/shop", request.nextUrl.origin));

  if (REFERRAL_CODE_RE.test(code)) {
    res.cookies.set("nvy-ref", code, {
      maxAge: 60 * 60 * 24 * 30, // a month — launch may be weeks away
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
}
