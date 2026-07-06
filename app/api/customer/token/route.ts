import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_CLIENT_ID,
  customerAccountsEnabled,
  getShopId,
  TOKEN_COOKIE,
} from "@/lib/customer-account";
import { log } from "@/lib/log";

/* Exchanges the PKCE authorization code for customer tokens and stores the
   access token in an httpOnly cookie — the browser never holds it. */

export async function POST(request: NextRequest) {
  if (!customerAccountsEnabled) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: { code?: unknown; verifier?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code : "";
  const verifier = typeof body.verifier === "string" ? body.verifier : "";
  if (!code || !verifier) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const shopId = await getShopId();
  if (!shopId) return NextResponse.json({ ok: false }, { status: 502 });

  const res = await fetch(
    `https://shopify.com/authentication/${shopId}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CUSTOMER_CLIENT_ID,
        redirect_uri: `${request.nextUrl.origin}/account/callback`,
        code,
        code_verifier: verifier,
      }),
    },
  );

  if (!res.ok) {
    log.error("customer_token_exchange_failed", {
      status: res.status,
      body: (await res.text()).slice(0, 200),
    });
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!json.access_token) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_COOKIE, json.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: json.expires_in ?? 3600,
  });
  log.info("customer_signed_in", {});
  return response;
}

/** Sign out: drop the session cookie. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
