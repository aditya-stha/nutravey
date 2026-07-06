import "server-only";
import { cookies } from "next/headers";
import { storefrontQuery } from "@/lib/shopify";
import { isShopifyConfigured } from "@/lib/shopify-config";
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

/** email+password → access token. Returns the token or a user-facing error. */
export async function signIn(
  email: string,
  password: string,
): Promise<{ token?: string; expiresAt?: string; error?: string }> {
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
      return {
        error:
          firstError(result.customerUserErrors) ??
          "Email or password didn't match.",
      };
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
): Promise<{ token?: string; expiresAt?: string; error?: string }> {
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
      return {
        error:
          firstError(data.customerCreate.customerUserErrors) ??
          "Couldn't create the account.",
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
