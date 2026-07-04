import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/log";

/* First-party analytics sink. Accepts only the known event vocabulary and
   emits one structured log line per event — queryable via the Vercel log
   drain today, portable to a warehouse table later without touching the
   client. Deliberately no cookies and no PII. */

const KNOWN_EVENTS = new Set([
  "view_item",
  "add_to_cart",
  "begin_checkout",
  "generate_lead",
]);

const MAX_BODY_BYTES = 2048;

export async function POST(request: NextRequest) {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (raw.length > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let body: { event?: unknown; params?: unknown; path?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (typeof body.event !== "string" || !KNOWN_EVENTS.has(body.event)) {
    return new NextResponse(null, { status: 400 });
  }

  log.info("client_event", {
    name: body.event,
    path: typeof body.path === "string" ? body.path.slice(0, 200) : undefined,
    params:
      body.params && typeof body.params === "object" ? body.params : undefined,
  });

  return new NextResponse(null, { status: 204 });
}
