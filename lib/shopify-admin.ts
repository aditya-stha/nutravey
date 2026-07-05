import "server-only";
import { SHOPIFY_STORE_DOMAIN } from "@/lib/shopify-config";
import { log } from "@/lib/log";

/* ─── Admin API auth ────────────────────────────────────────────────────────
   Since Jan 2026, Dev Dashboard custom apps don't expose a static Admin
   token — the app's Client ID + Secret are exchanged for a short-lived
   (~24 h) access token via the client_credentials grant. We do that here,
   cached in module memory and refreshed a minute before expiry.

   Legacy apps with a static `shpat_` token still work: if
   SHOPIFY_ADMIN_ACCESS_TOKEN is set, it wins and no exchange happens. */

let cached: { token: string; expiresAt: number } | null = null;

export async function getAdminToken(): Promise<string | null> {
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (staticToken) return staticToken;

  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  if (!clientId || !clientSecret || !SHOPIFY_STORE_DOMAIN) return null;

  if (cached && Date.now() < cached.expiresAt - 60_000) {
    return cached.token;
  }

  try {
    const res = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
      },
    );
    if (!res.ok) {
      log.error("admin_token_exchange_failed", {
        status: res.status,
        body: (await res.text()).slice(0, 200),
      });
      return null;
    }
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!json.access_token) {
      log.error("admin_token_exchange_failed", { reason: "no access_token" });
      return null;
    }
    cached = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 86_400) * 1000,
    };
    log.info("admin_token_exchanged", { expiresIn: json.expires_in });
    return cached.token;
  } catch (err) {
    log.error("admin_token_exchange_failed", { message: String(err) });
    return null;
  }
}
