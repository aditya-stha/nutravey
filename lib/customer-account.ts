import "server-only";
import { cookies } from "next/headers";
import { storefrontQuery } from "@/lib/shopify";
import {
  isShopifyConfigured,
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_PRIMARY_DOMAIN,
} from "@/lib/shopify-config";
import {
  findCustomerState,
  generateAccountActivationUrl,
} from "@/lib/shopify-admin";
import { sendActivationEmail } from "@/lib/email";
import { log } from "@/lib/log";

/* ─── Customer accounts — classic (fully headless) ──────────────────────────
   Sign-in, registration, and recovery run through the Storefront API's
   classic customer mutations, so every screen is ours — no Shopify-hosted
   login page, no redirects. The access token lives in an httpOnly cookie.
   Requires the store's customer accounts setting to allow classic/legacy
   accounts. */

export const customerAccountsEnabled = isShopifyConfigured;

export const TOKEN_COOKIE = "nvy-customer-token";

export interface CustomerOrder {
  name: string;
  processedAt: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  total: string;
  currency: string;
  items: string[];
  tracking?: { number?: string; url?: string };
  /** Shopify's live order-status page (fulfillment, tracking). */
  statusUrl?: string;
}

export interface CustomerSummary {
  firstName: string;
  email: string;
  orders: CustomerOrder[];
}

interface UserErrors {
  customerUserErrors: Array<{ code?: string; message: string }>;
}

function firstError(errs: UserErrors["customerUserErrors"]): string | null {
  return errs.length ? errs[0].message : null;
}

export interface AuthResult {
  token?: string;
  expiresAt?: string;
  error?: string;
  /** The email exists without a password; an activation link was emailed. */
  activationSent?: boolean;
}

/** Guards Shopify URLs we redeem server-side: only our own store's account
 *  activation/reset paths count — anything else is a smuggled foreign URL.
 *  Shopify mints these on the primary domain, but the .myshopify host is
 *  accepted too. */
export function isOurAccountUrl(
  raw: string,
  kind: "activate" | "reset",
): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === "https:" &&
      (url.hostname === SHOPIFY_STORE_DOMAIN ||
        url.hostname === SHOPIFY_PRIMARY_DOMAIN) &&
      url.pathname.startsWith(`/account/${kind}/`)
    );
  } catch {
    return false;
  }
}

/* ─── Activation bridge ─────────────────────────────────────────────────────
   A customer created back-office (waitlist, checkout, admin) has no password:
   sign-up collides ("taken") and sign-in can't ever succeed ("unidentified").
   When Admin access confirms that state, we mint an activation URL and email
   it — the customer sets a password on our own /account/activate page. The
   link travels by email only; the record's owner holds the inbox. */
async function tryActivationBridge(
  email: string,
  origin: string,
): Promise<boolean> {
  const customer = await findCustomerState(email);
  if (!customer || customer.state === "ENABLED") return false;
  const activationUrl = await generateAccountActivationUrl(customer.id);
  if (!activationUrl) return false;
  const ownUrl = `${origin}/account/activate?t=${encodeURIComponent(activationUrl)}`;
  const sent = await sendActivationEmail({ to: email, activateUrl: ownUrl });
  log[sent ? "info" : "warn"]("activation_bridge", { sent, state: customer.state });
  return sent;
}

/** email+password → access token. Returns the token or a user-facing error. */
export async function signIn(
  email: string,
  password: string,
  origin?: string,
): Promise<AuthResult> {
  try {
    const data = await storefrontQuery<{
      customerAccessTokenCreate: UserErrors & {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
      };
    }>(
      /* GraphQL */ `
        mutation signIn($input: CustomerAccessTokenCreateInput!) {
          customerAccessTokenCreate(input: $input) {
            customerAccessToken { accessToken expiresAt }
            customerUserErrors { code message }
          }
        }
      `,
      { input: { email, password } },
      { noStore: true },
    );
    const result = data.customerAccessTokenCreate;
    if (!result.customerAccessToken) {
      // "Unidentified customer" covers both wrong password and a
      // password-less back-office record — bridge the second case.
      if (origin && (await tryActivationBridge(email, origin))) {
        return { activationSent: true };
      }
      return { error: "Email or password didn't match." };
    }
    return {
      token: result.customerAccessToken.accessToken,
      expiresAt: result.customerAccessToken.expiresAt,
    };
  } catch (err) {
    log.error("customer_signin_failed", { message: String(err) });
    return { error: "Sign-in is briefly unavailable — try again." };
  }
}

/** Creates the account, then signs straight in. */
export async function signUp(
  firstName: string,
  email: string,
  password: string,
  origin?: string,
): Promise<AuthResult> {
  try {
    const data = await storefrontQuery<{
      customerCreate: UserErrors & { customer: { id: string } | null };
    }>(
      /* GraphQL */ `
        mutation signUp($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer { id }
            customerUserErrors { code message }
          }
        }
      `,
      { input: { firstName, email, password } },
      { noStore: true },
    );
    if (!data.customerCreate.customer) {
      const errs = data.customerCreate.customerUserErrors;
      const taken =
        errs.some((e) => e.code === "TAKEN") ||
        errs.some((e) => /taken|exists/i.test(e.message));
      if (taken) {
        if (origin && (await tryActivationBridge(email, origin))) {
          return { activationSent: true };
        }
        return {
          error:
            "This email already has an account — sign in, or use Forgot password.",
        };
      }
      return {
        error: firstError(errs) ?? "Couldn't create the account.",
      };
    }
    return signIn(email, password);
  } catch (err) {
    log.error("customer_signup_failed", { message: String(err) });
    return { error: "Registration is briefly unavailable — try again." };
  }
}

/** Sends Shopify's password-recovery email. Always claims success to the
 *  caller (no account-existence oracle for probing bots). */
export async function recover(email: string): Promise<void> {
  try {
    await storefrontQuery(
      /* GraphQL */ `
        mutation recover($email: String!) {
          customerRecover(email: $email) {
            customerUserErrors { code message }
          }
        }
      `,
      { email },
      { noStore: true },
    );
  } catch (err) {
    log.warn("customer_recover_failed", { message: String(err) });
  }
}

/** Redeems a Shopify activation URL with the customer's chosen password —
 *  enables the account and signs them straight in. */
export async function activateByUrl(
  activationUrl: string,
  password: string,
): Promise<AuthResult> {
  try {
    const data = await storefrontQuery<{
      customerActivateByUrl: UserErrors & {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
      };
    }>(
      /* GraphQL */ `
        mutation activate($activationUrl: URL!, $password: String!) {
          customerActivateByUrl(
            activationUrl: $activationUrl
            password: $password
          ) {
            customerAccessToken { accessToken expiresAt }
            customerUserErrors { code message }
          }
        }
      `,
      { activationUrl, password },
      { noStore: true },
    );
    const result = data.customerActivateByUrl;
    if (!result.customerAccessToken) {
      log.warn("customer_activation_rejected", {
        errors: result.customerUserErrors.map((e) => e.code ?? e.message),
      });
      return {
        error:
          "This activation link has expired or was already used — sign in, or use Forgot password.",
      };
    }
    return {
      token: result.customerAccessToken.accessToken,
      expiresAt: result.customerAccessToken.expiresAt,
    };
  } catch (err) {
    log.error("customer_activation_failed", { message: String(err) });
    return { error: "Activation is briefly unavailable — try again." };
  }
}

/** Redeems a Shopify password-reset URL (from the recovery email) with the
 *  customer's new password — resets it and signs them straight in. */
export async function resetByUrl(
  resetUrl: string,
  password: string,
): Promise<AuthResult> {
  try {
    const data = await storefrontQuery<{
      customerResetByUrl: UserErrors & {
        customerAccessToken: { accessToken: string; expiresAt: string } | null;
      };
    }>(
      /* GraphQL */ `
        mutation reset($resetUrl: URL!, $password: String!) {
          customerResetByUrl(resetUrl: $resetUrl, password: $password) {
            customerAccessToken { accessToken expiresAt }
            customerUserErrors { code message }
          }
        }
      `,
      { resetUrl, password },
      { noStore: true },
    );
    const result = data.customerResetByUrl;
    if (!result.customerAccessToken) {
      log.warn("customer_reset_rejected", {
        errors: result.customerUserErrors.map((e) => e.code ?? e.message),
      });
      return {
        error:
          "This reset link has expired or was already used — request a fresh one from Forgot password.",
      };
    }
    return {
      token: result.customerAccessToken.accessToken,
      expiresAt: result.customerAccessToken.expiresAt,
    };
  } catch (err) {
    log.error("customer_reset_failed", { message: String(err) });
    return { error: "Password reset is briefly unavailable — try again." };
  }
}

const CUSTOMER_QUERY = /* GraphQL */ `
  query Customer($token: String!) {
    customer(customerAccessToken: $token) {
      firstName
      email
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          name
          processedAt
          financialStatus
          fulfillmentStatus
          statusUrl
          totalPrice { amount currencyCode }
          lineItems(first: 10) {
            nodes {
              title
              variant { title }
            }
          }
          successfulFulfillments(first: 3) {
            trackingCompany
            trackingInfo(first: 3) { number url }
          }
        }
      }
    }
  }
`;

interface CustomerResponse {
  customer: {
    firstName: string | null;
    email: string | null;
    orders: {
      nodes: Array<{
        name: string;
        processedAt: string;
        financialStatus?: string;
        fulfillmentStatus?: string;
        statusUrl?: string;
        totalPrice: { amount: string; currencyCode: string };
        lineItems: {
          nodes: Array<{ title: string; variant: { title: string } | null }>;
        };
        successfulFulfillments?: Array<{
          trackingCompany?: string;
          trackingInfo?: Array<{ number?: string; url?: string }>;
        }>;
      }>;
    };
  } | null;
}

/** The signed-in customer (orders included), or null when signed out /
 *  token expired. */
export async function getCustomer(): Promise<CustomerSummary | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token || !customerAccountsEnabled) return null;

  try {
    const data = await storefrontQuery<CustomerResponse>(
      CUSTOMER_QUERY,
      { token },
      { noStore: true },
    );
    const customer = data.customer;
    if (!customer) return null;

    return {
      firstName: customer.firstName ?? "there",
      email: customer.email ?? "",
      orders: customer.orders.nodes.map((o) => {
        const tracking = o.successfulFulfillments?.[0]?.trackingInfo?.[0];
        return {
          name: o.name,
          processedAt: o.processedAt,
          financialStatus: o.financialStatus,
          fulfillmentStatus: o.fulfillmentStatus,
          statusUrl: o.statusUrl,
          total: o.totalPrice.amount,
          currency: o.totalPrice.currencyCode,
          items: o.lineItems.nodes
            .map((li) => li.variant?.title || li.title)
            .filter(Boolean),
          tracking:
            tracking?.url || tracking?.number
              ? { number: tracking.number, url: tracking.url }
              : undefined,
        };
      }),
    };
  } catch (err) {
    log.error("customer_query_failed", { message: String(err) });
    return null;
  }
}
