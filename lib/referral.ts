import "server-only";
import { getAdminToken } from "@/lib/shopify-admin";
import { SHOPIFY_STORE_DOMAIN } from "@/lib/shopify-config";
import { log } from "@/lib/log";

/* ─── Referral program ──────────────────────────────────────────────────────
   The reservation slot ID (NVY-XX-#####) doubles as the holder's referral
   code — it's already printed on their Ritual Pass. Friends get
   FRIEND_PCT off with it; each order that redeems one earns the referrer a
   one-time REWARD_PCT code (webhook-driven, emailed via Resend).
   Everything is stateless: Shopify stores the codes, the slot→referrer
   link lives in the customer's `slot-<id>` tag. */

export const FRIEND_PCT = 5;
export const REWARD_PCT = 5;

/** Slot IDs / referral codes look like NVY-ST-12345. */
export const REFERRAL_CODE_RE = /^NVY-[A-Z]{2}-\d{5}$/;

async function adminGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
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
    log.error("admin_graphql_errors", { errors: JSON.stringify(json.errors).slice(0, 300) });
    return null;
  }
  return json.data ?? null;
}

const CREATE_DISCOUNT = /* GraphQL */ `
  mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode { id }
      userErrors { field message }
    }
  }
`;

interface CreateDiscountResponse {
  discountCodeBasicCreate: {
    codeDiscountNode: { id: string } | null;
    userErrors: Array<{ field?: string[]; message: string }>;
  };
}

/** Creates a percentage discount code. Returns false on hard failure;
 *  "code already exists" counts as success (idempotent). */
export async function createDiscountCode({
  code,
  title,
  percent,
  usageLimit,
}: {
  code: string;
  title: string;
  percent: number;
  usageLimit?: number;
}): Promise<boolean> {
  const data = await adminGraphQL<CreateDiscountResponse>(CREATE_DISCOUNT, {
    basicCodeDiscount: {
      title,
      code,
      startsAt: new Date().toISOString(),
      customerSelection: { all: true },
      customerGets: {
        value: { percentage: percent / 100 },
        items: { all: true },
      },
      appliesOncePerCustomer: true,
      ...(usageLimit ? { usageLimit } : {}),
    },
  });
  if (!data) return false;
  const errors = data.discountCodeBasicCreate.userErrors;
  if (errors.length > 0) {
    const taken = errors.some((e) => /taken|exists/i.test(e.message));
    if (!taken) {
      log.error("discount_create_failed", { code, errors: errors.map((e) => e.message) });
      return false;
    }
  }
  log.info("discount_created", { code, percent, usageLimit });
  return true;
}

const CUSTOMER_BY_TAG = /* GraphQL */ `
  query customerByTag($query: String!) {
    customers(first: 1, query: $query) {
      nodes { email firstName }
    }
  }
`;

interface CustomerByTagResponse {
  customers: { nodes: Array<{ email: string | null; firstName: string | null }> };
}

/** Finds the reservation holder behind a slot ID via their `slot-<id>` tag. */
export async function findReferrerBySlot(
  slotId: string,
): Promise<{ email: string; firstName: string } | null> {
  const data = await adminGraphQL<CustomerByTagResponse>(CUSTOMER_BY_TAG, {
    query: `tag:'slot-${slotId}'`,
  });
  const hit = data?.customers.nodes[0];
  if (!hit?.email) return null;
  return { email: hit.email, firstName: hit.firstName ?? "there" };
}
