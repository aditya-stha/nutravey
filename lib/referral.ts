import "server-only";
import { adminGraphQL } from "@/lib/shopify-admin";
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

/** Slot IDs / referral codes look like NVY-ST-4829173 (5-digit codes are
 *  the pre-CSPRNG format, still honored). */
export const REFERRAL_CODE_RE = /^NVY-[A-Z]{2}-\d{5,7}$/;

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

/** Creates a percentage discount code. "exists" (already created — e.g. a
 *  webhook redelivery) is distinct from "created" so callers can make
 *  side effects like reward emails idempotent. */
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
}): Promise<"created" | "exists" | "failed"> {
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
  if (!data) return "failed";
  const errors = data.discountCodeBasicCreate.userErrors;
  if (errors.length > 0) {
    if (errors.some((e) => /taken|exists/i.test(e.message))) return "exists";
    log.error("discount_create_failed", { code, errors: errors.map((e) => e.message) });
    return "failed";
  }
  log.info("discount_created", { code, percent, usageLimit });
  return "created";
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
