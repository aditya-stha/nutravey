import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/* ─── HMAC-signed capability tokens ─────────────────────────────────────────
   Shared machinery for the Ritual Pass and order-status links: the payload
   itself is the token, HMAC-signed so it can't be forged or altered.
   Whoever holds the exact link can view it (capability URL — same model as
   a private Google Docs link).

   Production fails CLOSED: without PASS_SIGNING_SECRET, signing throws
   (no forgeable links are ever issued) and verification rejects every
   token (no forged links are ever honored). The dev fallback exists only
   outside production. */

const DEV_SECRET = "nutravey-dev-pass-secret";

function signingSecret(): string | null {
  const s = process.env.PASS_SIGNING_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") return null;
  return DEV_SECRET;
}

export function signToken(payload: unknown): string {
  const secret = signingSecret();
  if (!secret) {
    throw new Error(
      "PASS_SIGNING_SECRET is not set — refusing to issue a forgeable token in production",
    );
  }
  const body = Buffer.from(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest();
  return `${body.toString("base64url")}.${sig.toString("base64url")}`;
}

/** Verifies signature and shape; `isValid` narrows the parsed payload so a
 *  pass token can't be presented where an order token is expected. */
export function verifyToken<T>(
  token: string,
  isValid: (payload: unknown) => payload is T,
): T | null {
  const secret = signingSecret();
  if (!secret) return null; // unconfigured production — reject everything
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  try {
    const body = Buffer.from(token.slice(0, dot), "base64url");
    const got = Buffer.from(token.slice(dot + 1), "base64url");
    const expected = createHmac("sha256", secret).update(body).digest();
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
      return null;
    }
    const payload: unknown = JSON.parse(body.toString());
    return isValid(payload) ? payload : null;
  } catch {
    return null;
  }
}
