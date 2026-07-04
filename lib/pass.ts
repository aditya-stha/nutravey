import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { log } from "@/lib/log";

/* ─── Signed Ritual Pass tokens ─────────────────────────────────────────────
   The pass link must work with no database: the ticket data itself is the
   token, HMAC-signed so it can't be forged or altered. Whoever holds the
   exact link can view the pass (capability URL — same model as a private
   Google Docs link). Set PASS_SIGNING_SECRET in production; the dev
   fallback is fine locally but makes tokens forgeable if used live. */

export interface PassPayload {
  id: string;
  name: string;
  email: string;
  item: string;
  flavor: string;
  ts: number;
}

function secret(): string {
  const s = process.env.PASS_SIGNING_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      log.warn("pass_secret_missing", {
        hint: "set PASS_SIGNING_SECRET — pass links are forgeable without it",
      });
    }
    return "nutravey-dev-pass-secret";
  }
  return s;
}

export function signPass(payload: PassPayload): string {
  const body = Buffer.from(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(body).digest();
  return `${body.toString("base64url")}.${sig.toString("base64url")}`;
}

export function verifyPass(token: string): PassPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  try {
    const body = Buffer.from(token.slice(0, dot), "base64url");
    const got = Buffer.from(token.slice(dot + 1), "base64url");
    const expected = createHmac("sha256", secret()).update(body).digest();
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) {
      return null;
    }
    const payload = JSON.parse(body.toString()) as PassPayload;
    if (typeof payload.id !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
