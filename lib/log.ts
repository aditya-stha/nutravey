/* ─── Structured server logging ─────────────────────────────────────────────
   Single-line JSON to stdout/stderr — searchable in Vercel's log drain and
   trivially parseable later. Server-side only (route handlers,
   instrumentation); the client analytics helper lives in lib/analytics.ts. */

type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, event: string, data: Record<string, unknown>) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, data: Record<string, unknown> = {}) =>
    emit("info", event, data),
  warn: (event: string, data: Record<string, unknown> = {}) =>
    emit("warn", event, data),
  error: (event: string, data: Record<string, unknown> = {}) =>
    emit("error", event, data),
};
