import "server-only";
import { cookies } from "next/headers";
import { storefrontQuery } from "@/lib/shopify";
import { log } from "@/lib/log";

/* ─── Customer Account API (server side) ────────────────────────────────────
   Shopify's customer login for headless stores: OAuth 2 + PKCE against
   shopify.com, tokens held in httpOnly cookies, orders queried server-side.
   Enabled by NEXT_PUBLIC_SHOPIFY_CUSTOMER_CLIENT_ID (Headless channel →
   Customer Account API); the /account/callback URL must be registered
   there as a callback URI. */

export const CUSTOMER_CLIENT_ID =
  process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_CLIENT_ID ?? "";

export const customerAccountsEnabled = Boolean(CUSTOMER_CLIENT_ID);

export const TOKEN_COOKIE = "nvy-customer-token";

/** Numeric shop id, needed for the shopify.com auth + API endpoints.
 *  Derived once from the Storefront API (gid://shopify/Shop/<id>). */
export async function getShopId(): Promise<string | null> {
  try {
    const data = await storefrontQuery<{ shop: { id: string } }>(
      /* GraphQL */ `{ shop { id } }`,
    );
    return data.shop.id.split("/").pop() ?? null;
  } catch (err) {
    log.error("shop_id_lookup_failed", { message: String(err) });
    return null;
  }
}

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

/** Loads the signed-in customer via the Customer Account API GraphQL.
 *  Returns null when signed out or the token has expired. */
export async function getCustomer(): Promise<CustomerSummary | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token || !customerAccountsEnabled) return null;

  const shopId = await getShopId();
  if (!shopId) return null;

  try {
    const res = await fetch(
      `https://shopify.com/${shopId}/account/customer/api/2026-04/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          query: /* GraphQL */ `
            {
              customer {
                firstName
                emailAddress { emailAddress }
                orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
                  nodes {
                    name
                    processedAt
                    financialStatus
                    totalPrice { amount currencyCode }
                    lineItems(first: 10) {
                      nodes { title variantTitle }
                    }
                    fulfillments(first: 3) {
                      nodes {
                        status
                        trackingInformation { number url }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      log.warn("customer_query_failed", { status: res.status });
      return null;
    }
    const json = (await res.json()) as {
      data?: {
        customer: {
          firstName: string | null;
          emailAddress: { emailAddress: string } | null;
          orders: {
            nodes: Array<{
              name: string;
              processedAt: string;
              financialStatus?: string;
              totalPrice: { amount: string; currencyCode: string };
              lineItems?: {
                nodes: Array<{ title?: string; variantTitle?: string }>;
              };
              fulfillments?: {
                nodes: Array<{
                  status?: string;
                  trackingInformation?: Array<{ number?: string; url?: string }> | { number?: string; url?: string };
                }>;
              };
            }>;
          };
        };
      };
      errors?: unknown;
    };
    const customer = json.data?.customer;
    if (!customer) {
      if (json.errors) {
        log.warn("customer_query_errors", {
          errors: JSON.stringify(json.errors).slice(0, 300),
        });
      }
      return null;
    }
    return {
      firstName: customer.firstName ?? "there",
      email: customer.emailAddress?.emailAddress ?? "",
      orders: customer.orders.nodes.map((o) => {
        const fulfillment = o.fulfillments?.nodes?.[0];
        const trackingRaw = fulfillment?.trackingInformation;
        const tracking = Array.isArray(trackingRaw)
          ? trackingRaw[0]
          : trackingRaw;
        return {
          name: o.name,
          processedAt: o.processedAt,
          financialStatus: o.financialStatus,
          fulfillmentStatus: fulfillment?.status,
          total: o.totalPrice.amount,
          currency: o.totalPrice.currencyCode,
          items: (o.lineItems?.nodes ?? [])
            .map((li) => li.variantTitle || li.title || "")
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
