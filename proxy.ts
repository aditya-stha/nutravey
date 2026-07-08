import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GATE_COOKIE, gatePassword, isGateCookieValid } from "@/lib/dev-gate";

/* ─── Pre-launch access gate ────────────────────────────────────────────────
   Locks the entire site behind /gate while DEV_GATE_PASSWORD is set.
   See lib/dev-gate.ts for the cookie scheme. */

const OPEN_PREFIXES = [
  "/gate", // the password screen itself (page + its server action POST)
  "/api/webhooks", // Shopify calls these server-to-server — no cookie to send
];

export function proxy(request: NextRequest) {
  if (!gatePassword()) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const open = OPEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (open || isGateCookieValid(request.cookies.get(GATE_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "locked" }, { status: 401 });
  }

  const gate = new URL("/gate", request.url);
  const from = pathname + search;
  if (from !== "/") gate.searchParams.set("from", from);
  return NextResponse.redirect(gate);
}

export const config = {
  // Skip build output and public files (anything with an extension) —
  // every page and API route passes through the gate.
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
