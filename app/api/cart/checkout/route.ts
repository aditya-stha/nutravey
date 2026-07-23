import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontQuery } from "@/lib/shopify";
import { SHOPIFY_PRIMARY_DOMAIN } from "@/lib/shopify-config";
import { TOKEN_COOKIE } from "@/lib/customer-account";
import { log } from "@/lib/log";

/* ─── Checkout bridge (unlock + optional account association) ─────────────────
   Checkout is NOT gated on sign-in. One server call does:

   1. store-password unlock — while the store is password-protected, checkout on
      shop.nutravey.com sits behind the password wall. We fetch the
      storefront_digest from the PRIMARY domain and re-set it as a cookie scoped
      to the shared registrable domain (nutravey.com) so it reaches the checkout
      host when the browser follows checkoutUrl. (The old /api/unlock left the
      cookie host-only for the app host, so it never crossed the subdomain.)

   2. optional buyerIdentity — if the shopper is signed in (httpOnly session
      token present), the cart is associated with their customer so checkout is
      pre-filled and the order is attributed to their account for /account
      tracking. Not signed in → plain guest checkout, exactly as before.

   The browser applies the digest cookie from this same-origin fetch response,
   then navigates to the returned checkoutUrl. */

const CART_BUYER_IDENTITY_UPDATE = /* GraphQL */ `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }
`;

/** POST the store password to the primary domain and pull the storefront_digest
 *  Shopify hands back. Returns null when the store isn't locked or the request
 *  fails — a locked store then just shows its password page (pre-fix behaviour),
 *  never a hard checkout error. */
async function storeDigest(): Promise<string | null> {
  const password = process.env.SHOPIFY_STORE_PASSWORD;
  if (!password) return null;
  try {
    const res = await fetch(`https://${SHOPIFY_PRIMARY_DOMAIN}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        form_type: "storefront_password",
        utf8: "✓",
        password,
      }).toString(),
      redirect: "manual",
      cache: "no-store",
    });
    const setCookies = res.headers.getSetCookie?.() ?? [];
    const digest = setCookies.find((c) => c.startsWith("storefront_digest="));
    if (!digest) return null;
    return digest.slice("storefront_digest=".length).split(";")[0] || null;
  } catch (err) {
    log.warn("store_digest_failed", { message: String(err) });
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: { cartId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const cartId = typeof body.cartId === "string" ? body.cartId : "";
  if (!cartId.startsWith("gid://shopify/Cart/")) {
    return NextResponse.json({ ok: false, error: "bad_cart" }, { status: 400 });
  }

  // Signed-in → attribute the order to the customer; guest → empty (no-op).
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const buyerIdentity = token ? { customerAccessToken: token } : {};

  try {
    const data = await storefrontQuery<{
      cartBuyerIdentityUpdate: {
        cart: { checkoutUrl: string | null } | null;
        userErrors: { field: string[] | null; message: string }[];
      };
    }>(
      CART_BUYER_IDENTITY_UPDATE,
      { cartId, buyerIdentity },
      { noStore: true },
    );

    const result = data.cartBuyerIdentityUpdate;
    if (result.userErrors.length > 0 || !result.cart?.checkoutUrl) {
      log.warn("cart_checkout_failed", { errors: result.userErrors });
      return NextResponse.json({ ok: false, error: "checkout_failed" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, checkoutUrl: result.cart.checkoutUrl });

    // Unlock: bridge the store password to the checkout subdomain.
    const digest = await storeDigest();
    if (digest) {
      const cookieDomain = SHOPIFY_PRIMARY_DOMAIN.split(".").slice(-2).join(".");
      response.cookies.set("storefront_digest", digest, {
        domain: cookieDomain,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    return response;
  } catch (err) {
    log.error("cart_checkout_error", { message: String(err) });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
