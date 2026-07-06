import "server-only";
import { storefrontQuery } from "@/lib/shopify";
import { adminGraphQL } from "@/lib/shopify-admin";
import { getCustomer } from "@/lib/customer-account";
import { getProduct, type ProductSlug } from "@/lib/products";
import { seedReviews } from "@/lib/reviews-seed";
import { SHOPIFY_STORE_DOMAIN } from "@/lib/shopify-config";
import { log } from "@/lib/log";

/* ─── Reviews ───────────────────────────────────────────────────────────────
   Two sources, one display:
   1. Shopify metaobjects (type `customer_review`) — created by the API for
      verified buyers, or by the marketing team in admin → Content →
      Metaobjects. Definition fields: product, rating, title, body, author,
      date, verified.
   2. lib/reviews-seed.ts — code-side PR entries, no credentials needed.

   The "Verified buyer" badge is earned, never assigned: only reviews
   created through submitReview() carry verified=true, and that path
   requires a signed-in customer with a PAID + fulfilled order containing
   the product. That's the bot-proofing — no purchase, no review. */

export interface Review {
  product: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
  verified: boolean;
}

const METAOBJECT_TYPE = "customer_review";

const REVIEWS_QUERY = /* GraphQL */ `
  query Reviews {
    metaobjects(type: "${METAOBJECT_TYPE}", first: 100) {
      nodes {
        fields { key value }
      }
    }
  }
`;

interface ReviewsResponse {
  metaobjects: { nodes: Array<{ fields: Array<{ key: string; value: string | null }> }> };
}

function fromFields(fields: Array<{ key: string; value: string | null }>): Review | null {
  const get = (k: string) => fields.find((f) => f.key === k)?.value ?? "";
  const rating = Number(get("rating"));
  if (!get("product") || !get("body") || !rating) return null;
  return {
    product: get("product"),
    rating: Math.min(5, Math.max(1, rating)),
    title: get("title"),
    body: get("body"),
    author: get("author") || "Anonymous",
    date: get("date") || "",
    verified: get("verified") === "true",
  };
}

/** All published reviews for a product, metaobjects + seed, newest first. */
export async function getReviews(slug: string): Promise<Review[]> {
  let remote: Review[] = [];
  if (SHOPIFY_STORE_DOMAIN) {
    try {
      const data = await storefrontQuery<ReviewsResponse>(REVIEWS_QUERY);
      remote = data.metaobjects.nodes
        .map((n) => fromFields(n.fields))
        .filter((r): r is Review => r !== null);
    } catch {
      // Definition not created yet — seed-only is a valid state.
    }
  }
  return [...remote, ...seedReviews]
    .filter((r) => r.product === slug)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

/** Paid + fulfilled order containing this product = eligible to review. */
export async function reviewEligibility(
  slug: ProductSlug | string,
): Promise<{ eligible: boolean; reason: string; author?: string }> {
  const customer = await getCustomer();
  if (!customer) {
    return { eligible: false, reason: "Sign in to review." };
  }
  let name = "";
  try {
    name = getProduct(slug as ProductSlug).name.toLowerCase();
  } catch {
    return { eligible: false, reason: "Unknown product." };
  }
  const owned = customer.orders.some((o) => {
    const paid = (o.financialStatus ?? "").toUpperCase().includes("PAID");
    const status = (o.fulfillmentStatus ?? "").toUpperCase();
    // Fulfillment node statuses vary by API surface — accept the shipped family.
    const shipped = ["SUCCESS", "FULFILLED", "DELIVERED"].some((s) =>
      status.includes(s),
    );
    const hasItem = o.items.some((i) => i.toLowerCase() === name);
    return paid && shipped && hasItem;
  });
  if (!owned) {
    return {
      eligible: false,
      reason: "Reviews open once your order of this ritual has shipped.",
    };
  }
  return { eligible: true, reason: "", author: customer.firstName };
}

const CREATE_REVIEW = /* GraphQL */ `
  mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }
`;

interface CreateReviewResponse {
  metaobjectCreate: {
    metaobject: { id: string } | null;
    userErrors: Array<{ message: string }>;
  };
}

/** Persists a verified review as a metaobject. Falls back to a loud log
 *  (recoverable, manual re-entry) when Admin API isn't configured. */
export async function persistReview(review: Review): Promise<boolean> {
  const data = await adminGraphQL<CreateReviewResponse>(CREATE_REVIEW, {
    metaobject: {
      type: METAOBJECT_TYPE,
      fields: [
        { key: "product", value: review.product },
        { key: "rating", value: String(review.rating) },
        { key: "title", value: review.title },
        { key: "body", value: review.body },
        { key: "author", value: review.author },
        { key: "date", value: review.date },
        { key: "verified", value: String(review.verified) },
      ],
    },
  });
  if (!data || data.metaobjectCreate.userErrors.length > 0) {
    log.warn("review_unpersisted", {
      review: JSON.stringify(review).slice(0, 500),
      errors: data?.metaobjectCreate.userErrors.map((e) => e.message),
    });
    return false;
  }
  log.info("review_persisted", { product: review.product, rating: review.rating });
  return true;
}
