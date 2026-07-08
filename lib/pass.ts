import "server-only";
import { signToken, verifyToken } from "@/lib/signed-token";

/* ─── Signed Ritual Pass tokens ─────────────────────────────────────────────
   The pass link works with no database: the ticket data itself is the
   token. See lib/signed-token.ts for the signing model — production
   requires PASS_SIGNING_SECRET and fails closed without it. */

export interface PassPayload {
  id: string;
  name: string;
  email: string;
  item: string;
  flavor: string;
  ts: number;
}

function isPassPayload(p: unknown): p is PassPayload {
  const o = p as Partial<PassPayload> | null;
  return (
    typeof o === "object" &&
    o !== null &&
    typeof o.id === "string" &&
    typeof o.email === "string" &&
    typeof o.flavor === "string"
  );
}

export function signPass(payload: PassPayload): string {
  return signToken(payload);
}

export function verifyPass(token: string): PassPayload | null {
  return verifyToken(token, isPassPayload);
}
