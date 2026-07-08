import { createHmac, timingSafeEqual } from "node:crypto";

/* ─── Pre-launch dev gate ───────────────────────────────────────────────────
   While nutravey.com is in development the whole site sits behind a single
   shared password. Active only when DEV_GATE_PASSWORD is set (i.e. on
   Vercel); unset locally, so day-to-day dev is untouched. Remove the env
   var to open the site at launch — no deploy needed.

   The cookie value is an HMAC keyed by the password itself, so rotating
   DEV_GATE_PASSWORD invalidates every previously issued cookie at once.

   No `server-only` import here: proxy.ts consumes this module, and the
   proxy bundle is compiled outside the RSC graph. Nothing in this file
   leaks — the password only ever comes out of process.env on the server. */

export const GATE_COOKIE = "nv_gate";

export function gatePassword(): string | null {
  return process.env.DEV_GATE_PASSWORD || null;
}

/** The cookie value that proves the password was entered. */
export function expectedGateCookie(): string | null {
  const password = gatePassword();
  if (!password) return null;
  return createHmac("sha256", password)
    .update("nutravey-dev-gate-v1")
    .digest("base64url");
}

export function isGateCookieValid(value: string | undefined): boolean {
  const expected = expectedGateCookie();
  if (!expected || !value) return false;
  const got = Buffer.from(value);
  const want = Buffer.from(expected);
  return got.length === want.length && timingSafeEqual(got, want);
}

/** Constant-time password check — both sides are hashed first so the
 *  comparison never leaks length or prefix. */
export function isGatePasswordCorrect(attempt: string): boolean {
  const password = gatePassword();
  if (!password) return false;
  const a = createHmac("sha256", "nv-gate-compare").update(attempt).digest();
  const b = createHmac("sha256", "nv-gate-compare").update(password).digest();
  return timingSafeEqual(a, b);
}
