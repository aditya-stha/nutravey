import "server-only";
import { cookies } from "next/headers";
import { PRE_LAUNCH_COOKIE, resolvePreLaunch } from "@/lib/pre-launch";

/** Server-side effective mode: the `nv_mode` cookie override, else the env
 *  default. Reading the cookie opts the calling route into dynamic rendering,
 *  so only call this from routes that already branch on the mode server-side
 *  (currently /shop and /account). */
export async function getPreLaunch(): Promise<boolean> {
  const store = await cookies();
  return resolvePreLaunch(store.get(PRE_LAUNCH_COOKIE)?.value);
}
