import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontQuery } from "@/lib/shopify";
import { SHOPIFY_PRIMARY_DOMAIN } from "@/lib/shopify-config";
import { TOKEN_COOKIE } from "@/lib/customer-account";
import { log } from "@/lib/log";

/* ─── Account-gated checkout (unlock + buyerIdentity) ────────────────────────
   Checkout requires a signed-in customer. One server call does two things:

   1. buyerIdentity — associates the Hydrogen cart with the customer via their
      Storefront access token (read from the httpOnly session cookie; the token
      never reaches client JS), so checkout is pre-filled and the order is
      attributed to their account for /account tracking.

   2. store-password unlock — while the Shopify store is password-protected,
      checkout on shop.nutravey.com sits behind the password wall. We fetch the
      storefront_digest from the *primary* domain and re-set it as a cookie
      scoped to the shared registrable domain (nutravey.com), so it's sent to
      shop.nutravey.com when the browser follows checkoutUrl. Scoping to the
      parent is the fix the old /api/unlock lacked (its cookie stayed
      host-only for the app host and never reached the checkout subdomain).

   The browser applies both from this same-origin fetch response, then
   navigates to the returned checkoutUrl carrying the digest cookie. */

const CART_BUYER_IDENTITY_UPDATE = /* GraphQL */ `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        checkoutUrl
        buyerIdentity { email customer { id } }
      }
      userErrors { field message }
    }
  }
`;

/** POST the store password to the primary domain and pull the storefront_digest
 *  value Shopify hands back. Returns null when the store isn't locked or the
 *  request fails — a locked store then just shows its password page, which is
 *  the pre-fix behaviour, never a hard checkout error. */
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
    // "storefront_digest=<value>; path=/; ..." → "<value>"
    return digest.slice("storefront_digest=".length).split(";")[0] || null;
  } catch (err) {
    log.warn("store_digest_failed", { message: String(err) });
    return null;
  }
}

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "not_signed_in" }, { status: 401 });
  }

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

  try {
    const data = await storefrontQuery<{
      cartBuyerIdentityUpdate: {
        cart: {
          checkoutUrl: string | null;
          buyerIdentity: { customer: { id: string } | null } | null;
        } | null;
        userErrors: { field: string[] | null; message: string }[];
      };
    }>(
      CART_BUYER_IDENTITY_UPDATE,
      { cartId, buyerIdentity: { customerAccessToken: token } },
      { noStore: true },
    );

    const result = data.cartBuyerIdentityUpdate;
    if (result.userErrors.length > 0 || !result.cart?.checkoutUrl) {
      log.warn("cart_associate_failed", { errors: result.userErrors });
      return NextResponse.json({ ok: false, error: "associate_failed" }, { status: 400 });
    }
    if (!result.cart.buyerIdentity?.customer) {
      // Token expired/invalid — the mutation accepts it but attaches no
      // customer. Treat as "sign in again" rather than a silent guest order.
      return NextResponse.json({ ok: false, error: "session_expired" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, checkoutUrl: result.cart.checkoutUrl });

    // Unlock: bridge the store password to the checkout subdomain.
    const digest = await storeDigest();
    if (digest) {
      // Registrable parent of shop.nutravey.com → nutravey.com, so the cookie
      // is visible to both the app host and the checkout host.
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
