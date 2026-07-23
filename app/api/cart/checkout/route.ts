import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storefrontQuery } from "@/lib/shopify";
import { TOKEN_COOKIE } from "@/lib/customer-account";
import { log } from "@/lib/log";

/* ─── Account-gated checkout ─────────────────────────────────────────────────
   Checkout requires a signed-in customer. This associates the Hydrogen cart
   with the customer via their Storefront access token (read from the httpOnly
   session cookie — the token never touches client JS), then returns the
   customer-attributed checkout URL for the browser to follow. buyerIdentity
   pre-fills the shopper's identity at checkout without a second Shopify login,
   and attributes the order to their account for /account order tracking. */

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
    // An expired/invalid token is accepted by the mutation but leaves no
    // customer attached — treat that as "sign in again" rather than a silent
    // guest checkout.
    if (!result.cart.buyerIdentity?.customer) {
      return NextResponse.json({ ok: false, error: "session_expired" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, checkoutUrl: result.cart.checkoutUrl });
  } catch (err) {
    log.error("cart_checkout_error", { message: String(err) });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
