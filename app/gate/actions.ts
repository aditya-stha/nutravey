"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  GATE_COOKIE,
  expectedGateCookie,
  isGatePasswordCorrect,
} from "@/lib/dev-gate";
import { createRateLimiter } from "@/lib/rate-limit";

const limited = createRateLimiter({ limit: 10, windowMs: 10 * 60_000 });

function gateUrl(from: string, error: "wrong" | "slow"): string {
  const params = new URLSearchParams({ e: error });
  if (from !== "/") params.set("from", from);
  return `/gate?${params}`;
}

/** Only same-site paths — a tampered `from` must not become an open redirect. */
function sanitizeFrom(value: FormDataEntryValue | null): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/";
}

export async function unlockSite(formData: FormData): Promise<void> {
  const from = sanitizeFrom(formData.get("from"));

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (limited(ip)) redirect(gateUrl(from, "slow"));

  const attempt = formData.get("password");
  if (typeof attempt !== "string" || !isGatePasswordCorrect(attempt)) {
    redirect(gateUrl(from, "wrong"));
  }

  const value = expectedGateCookie();
  if (!value) redirect("/"); // gate not configured — nothing to unlock

  (await cookies()).set(GATE_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // re-enter monthly during the dev phase
  });
  redirect(from);
}
