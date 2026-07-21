/* ─── Pre-launch / live mode ───────────────────────────────────────────────
   The build-time default comes from NEXT_PUBLIC_PRE_LAUNCH (set per Vercel
   environment / dev script). A per-session `nv_mode` cookie overrides it so
   both modes are debuggable on a single deployment — flip it with the
   floating ModeToggle. Remove the toggle at public launch and the env var
   alone governs the mode again. */

export const PRE_LAUNCH_COOKIE = "nv_mode";

/** Build-time default. NEXT_PUBLIC_ so it resolves identically on server and
 *  client (no hydration mismatch). Defaults to pre-launch unless explicitly
 *  set to "false". */
export function envPreLaunch(): boolean {
  return process.env.NEXT_PUBLIC_PRE_LAUNCH !== "false";
}

/** Effective mode given a cookie value: an explicit override wins, otherwise
 *  fall back to the env default. */
export function resolvePreLaunch(cookieValue: string | undefined): boolean {
  if (cookieValue === "live") return false;
  if (cookieValue === "prelaunch") return true;
  return envPreLaunch();
}
