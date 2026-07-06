/* ─── Marketing / PR reviews (seed) ─────────────────────────────────────────
   The zero-setup channel for the marketing team: add entries here and they
   render on the PDPs immediately (no admin credentials needed). Once the
   Shopify metaobject definition exists, prefer Content → Metaobjects in
   Shopify admin — same display, editable without a deploy.

   RULES OF THE ROAD:
   - `verified` stays FALSE for seeded entries. The "Verified buyer" badge
     is earned only by API-created reviews from paid, fulfilled customer
     accounts — never hand it out here.
   - `product` is the flavour slug: strawberry-surge | lychee-lush |
     lemon-zest | the-curation
   - rating is 1–5. Keep bodies short; the PDP shows them as written. */

export interface SeedReview {
  product: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string; // ISO, e.g. "2026-07-01"
  verified: false;
}

export const seedReviews: SeedReview[] = [
  // Example (uncomment and edit):
  // {
  //   product: "strawberry-surge",
  //   rating: 5,
  //   title: "The morning actually changed",
  //   body: "Replaced my second coffee entirely. The strawberry is real fruit, not candy.",
  //   author: "Maya R.",
  //   date: "2026-07-01",
  //   verified: false,
  // },
];
