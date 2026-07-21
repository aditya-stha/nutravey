import { NextRequest, NextResponse } from "next/server";
import {
  customerAccountsEnabled,
  signIn,
  signUp,
  recover,
  activateByUrl,
  resetByUrl,
  isOurAccountUrl,
  TOKEN_COOKIE,
} from "@/lib/customer-account";
import { createRateLimiter, clientIp } from "@/lib/rate-limit";
import { log } from "@/lib/log";

/* ─── Customer session ──────────────────────────────────────────────────────
   POST { mode: "login" | "register" | "recover" | "activate" | "reset",
          email?, password?, firstName?, activationUrl?, resetUrl? }
   Sets the httpOnly session cookie on success. Rate-limited per IP —
   an auth endpoint is a password-guessing surface. */

// 10 attempts per IP per 10 minutes.
const rateLimited = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  if (!customerAccountsEnabled) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts — wait a few minutes." },
      { status: 429 },
    );
  }

  let body: {
    mode?: unknown;
    email?: unknown;
    password?: unknown;
    firstName?: unknown;
    activationUrl?: unknown;
    resetUrl?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const mode = typeof body.mode === "string" ? body.mode : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : "";
  const activationUrl =
    typeof body.activationUrl === "string" ? body.activationUrl : "";
  const resetUrl = typeof body.resetUrl === "string" ? body.resetUrl : "";

  if (mode !== "activate" && mode !== "reset" && !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email doesn't look right." },
      { status: 400 },
    );
  }

  if (mode === "recover") {
    await recover(email);
    return NextResponse.json({ ok: true });
  }

  if (
    mode !== "login" &&
    mode !== "register" &&
    mode !== "activate" &&
    mode !== "reset"
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password needs at least 8 characters." },
      { status: 400 },
    );
  }
  if (mode === "register" && !firstName) {
    return NextResponse.json(
      { ok: false, error: "Tell us your first name." },
      { status: 400 },
    );
  }
  if (mode === "activate" && !isOurAccountUrl(activationUrl, "activate")) {
    return NextResponse.json(
      { ok: false, error: "This activation link isn't valid." },
      { status: 400 },
    );
  }
  if (mode === "reset" && !isOurAccountUrl(resetUrl, "reset")) {
    return NextResponse.json(
      { ok: false, error: "This reset link isn't valid." },
      { status: 400 },
    );
  }

  const origin = request.nextUrl.origin;
  const result =
    mode === "login"
      ? await signIn(email, password, origin)
      : mode === "register"
        ? await signUp(firstName, email, password, origin)
        : mode === "activate"
          ? await activateByUrl(activationUrl, password)
          : await resetByUrl(resetUrl, password);

  if (result.activationSent) {
    log.info("customer_activation_sent", {});
    return NextResponse.json({ ok: true, activationSent: true });
  }
  if (!result.token) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "Try again." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  const maxAge = result.expiresAt
    ? Math.max(
        60,
        Math.floor((new Date(result.expiresAt).getTime() - Date.now()) / 1000),
      )
    : 60 * 60 * 24 * 7;
  response.cookies.set(TOKEN_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  log.info("customer_session_created", { mode });
  return response;
}

/** Sign out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TOKEN_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
