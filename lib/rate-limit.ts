import "server-only";
import type { NextRequest } from "next/server";

/* ─── Per-IP sliding-window rate limiter ────────────────────────────────────
   Per-instance memory. Serverless instances don't share it, which is
   acceptable at this traffic level — swap for a shared store (Upstash /
   Vercel KV) when traffic justifies it. The memory bound evicts the
   oldest-touched keys instead of clearing the map, so an attacker can't
   reset their own window by flooding it with fresh IPs. */

const MAX_KEYS = 10_000;

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): (key: string) => boolean {
  const hits = new Map<string, number[]>();

  return function rateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.delete(key); // re-insert so Map order tracks recency
    hits.set(key, recent);
    for (const k of hits.keys()) {
      if (hits.size <= MAX_KEYS) break;
      if (k !== key) hits.delete(k);
    }
    return recent.length > limit;
  };
}

/** Client IP as reported by the fronting proxy (Vercel sets it). */
export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}
