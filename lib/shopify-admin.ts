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

/** Admin API GraphQL call. Null when unconfigured or on errors (logged). */
export async function adminGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  const token = await getAdminToken();
  if (!token || !SHOPIFY_STORE_DOMAIN) return null;
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2026-04/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!res.ok) {
    log.error("admin_graphql_failed", { status: res.status });
    return null;
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    log.error("admin_graphql_errors", {
      errors: JSON.stringify(json.errors).slice(0, 300),
    });
    return null;
  }
  return json.data ?? null;
}

/* ─── Order request stamping ────────────────────────────────────────────────
   Makes /account cancel/change requests visible in the Shopify backend:
   tags the order (cancel-requested / change-requested) and appends the
   customer's message to the order note. Env-gated like all Admin access. */

interface FindOrderResponse {
  orders: { nodes: Array<{ id: string; note: string | null }> };
}
interface TagsAddResponse {
  tagsAdd: { userErrors: Array<{ message: string }> };
}
interface OrderUpdateResponse {
  orderUpdate: {
    order: { id: string } | null;
    userErrors: Array<{ message: string }>;
  };
}

export async function flagOrderRequest(
  orderName: string,
  kind: "cancel" | "change",
  message: string,
  customerEmail: string,
): Promise<boolean> {
  const found = await adminGraphQL<FindOrderResponse>(
    /* GraphQL */ `
      query findOrder($q: String!) {
        orders(first: 1, query: $q) {
          nodes { id note }
        }
      }
    `,
    { q: `name:${orderName}` },
  );
  const order = found?.orders.nodes[0];
  if (!order) {
    log.warn("order_request_unstamped", { orderName, reason: "not found or admin unconfigured" });
    return false;
  }

  const stamp = `[${new Date().toISOString().slice(0, 16)}] ${kind.toUpperCase()} REQUEST from ${customerEmail}: ${message || "(no message)"}`;
  const note = order.note ? `${order.note}\n\n${stamp}` : stamp;

  const [tagged, noted] = await Promise.all([
    adminGraphQL<TagsAddResponse>(
      /* GraphQL */ `
        mutation tag($id: ID!, $tags: [String!]!) {
          tagsAdd(id: $id, tags: $tags) {
            userErrors { message }
          }
        }
      `,
      { id: order.id, tags: [`${kind}-requested`] },
    ),
    adminGraphQL<OrderUpdateResponse>(
      /* GraphQL */ `
        mutation note($input: OrderInput!) {
          orderUpdate(input: $input) {
            order { id }
            userErrors { message }
          }
        }
      `,
      { input: { id: order.id, note } },
    ),
  ]);

  const ok =
    (tagged?.tagsAdd.userErrors.length ?? 1) === 0 &&
    (noted?.orderUpdate.userErrors.length ?? 1) === 0;
  log[ok ? "info" : "warn"]("order_request_stamped", { orderName, kind, ok });
  return ok;
}

/* ─── Customer create-or-tag (GraphQL — new apps have no REST access) ──────
   Creates the customer; if the email already exists, finds them and adds
   the new tags instead, so every reservation's slot-<id> tag lands. */

interface CustomerCreateResponse {
  customerCreate: {
    customer: { id: string } | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
}
interface CustomerByEmailResponse {
  customers: { nodes: Array<{ id: string }> };
}

export async function createOrTagCustomer({
  firstName,
  email,
  tags,
  note,
}: {
  firstName: string;
  email: string;
  tags: string[];
  note: string;
}): Promise<boolean> {
  const created = await adminGraphQL<CustomerCreateResponse>(
    /* GraphQL */ `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer { id }
          userErrors { field message }
        }
      }
    `,
    {
      input: {
        firstName,
        email,
        tags,
        note,
        emailMarketingConsent: {
          marketingState: "SUBSCRIBED",
          marketingOptInLevel: "SINGLE_OPT_IN",
        },
      },
    },
  );
  if (!created) return false;
  if (created.customerCreate.customer) return true;

  const errors = created.customerCreate.userErrors;
  const taken = errors.some((e) => /taken|exists/i.test(e.message));
  if (!taken) {
    log.error("customer_create_failed", {
      email,
      errors: errors.map((e) => e.message),
    });
    return false;
  }

  // Existing customer — attach the new slot/selection tags.
  const found = await adminGraphQL<CustomerByEmailResponse>(
    /* GraphQL */ `
      query customerByEmail($q: String!) {
        customers(first: 1, query: $q) { nodes { id } }
      }
    `,
    { q: `email:${email}` },
  );
  const id = found?.customers.nodes[0]?.id;
  if (!id) return false;

  const tagged = await adminGraphQL<{ tagsAdd: { userErrors: Array<{ message: string }> } }>(
    /* GraphQL */ `
      mutation tag($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) { userErrors { message } }
      }
    `,
    { id, tags },
  );
  return (tagged?.tagsAdd.userErrors.length ?? 1) === 0;
}
