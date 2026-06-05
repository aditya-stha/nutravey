/* ─── Shared product source of truth ──────────────────────────────────────
   Consumed by ProductTrio (homepage), the /shop grid, and every product
   detail page. Edit a product once; it changes everywhere. */

export type ProductSlug = "strawberry-surge" | "lychee-lush" | "lemon-zest";

export interface SupplementFact {
  label: string;
  amount: string;
  dv?: string; // percent daily value, optional
}

export interface Product {
  id: string;
  slug: ProductSlug;
  position: "left" | "center" | "right";
  name: string;
  flavour: "Strawberry" | "Lychee" | "Lemon";
  tagline: string;
  /** Short editorial summary used on the shop card and detail hero. */
  description: string;
  image: string;
  /** Flavour accent — used for glow, CTA, accent text. */
  accent: string;
  /** Cyclic CTA copy used on the homepage trio. */
  trioCta: string;
  price: number; // USD
  priceLabel: string;
  servings: number;
  ingredients: string[];
  benefits: { label: string; copy: string }[];
  usage: string[];
  supplementFacts: SupplementFact[];
}

export const products: Product[] = [
  {
    id: "strawberry",
    slug: "strawberry-surge",
    position: "left",
    name: "Strawberry Surge",
    flavour: "Strawberry",
    tagline: "Bold vitality.",
    description:
      "A morning surge of electrolytes, B-vitamins, and antioxidants — engineered for the days that demand momentum.",
    image: "/mock-strawberry-30.png",
    accent: "#C52B56",
    trioCta: "Begin Ritual",
    price: 42,
    priceLabel: "$42",
    servings: 30,
    ingredients: [
      "Strawberry fruit extract",
      "Coconut water powder",
      "Sodium · Potassium · Magnesium",
      "Vitamin C (ascorbic acid)",
      "B-complex (B6 · B12 · Niacin)",
      "Acerola cherry · Acai",
    ],
    benefits: [
      {
        label: "Hydration",
        copy:
          "A full-spectrum electrolyte profile to restore what training, travel, and long days deplete.",
      },
      {
        label: "Vitamins",
        copy:
          "100% RDI of Vitamin C plus a clean B-complex for energy metabolism and immune resilience.",
      },
      {
        label: "Antioxidants",
        copy:
          "Acerola and acai concentrate, polyphenols, and natural strawberry flavonoids — measured, not maxed.",
      },
    ],
    usage: [
      "Stir one sachet into 500 ml cold water.",
      "Best taken in the morning, on an empty stomach.",
      "One sachet per day. Do not exceed.",
    ],
    supplementFacts: [
      { label: "Calories", amount: "15 kcal" },
      { label: "Total Carbohydrate", amount: "3 g", dv: "1%" },
      { label: "Sodium", amount: "380 mg", dv: "17%" },
      { label: "Potassium", amount: "210 mg", dv: "4%" },
      { label: "Magnesium", amount: "60 mg", dv: "14%" },
      { label: "Vitamin C", amount: "90 mg", dv: "100%" },
      { label: "Vitamin B6", amount: "1.7 mg", dv: "100%" },
      { label: "Vitamin B12", amount: "2.4 mcg", dv: "100%" },
    ],
  },
  {
    id: "lychee",
    slug: "lychee-lush",
    position: "center",
    name: "Lychee Lush",
    flavour: "Lychee",
    tagline: "Soft radiance.",
    description:
      "A composed afternoon reset — botanical lychee, hyaluronic acid, and skin-supportive vitamins for a quieter kind of glow.",
    image: "/mock-lychee-30.png",
    accent: "#AA4198",
    trioCta: "Discover Flavour",
    price: 42,
    priceLabel: "$42",
    servings: 30,
    ingredients: [
      "Lychee fruit extract",
      "Hyaluronic acid (low molecular weight)",
      "Sodium · Potassium · Magnesium",
      "Vitamin E (mixed tocopherols)",
      "Biotin · Zinc",
      "White tea · Pomegranate",
    ],
    benefits: [
      {
        label: "Hydration",
        copy:
          "Cellular-level hydration with low-molecular hyaluronic acid layered over a balanced electrolyte base.",
      },
      {
        label: "Vitamins",
        copy:
          "Vitamin E, biotin, and zinc — chosen for skin, hair, and the quiet maintenance of radiance.",
      },
      {
        label: "Electrolytes",
        copy:
          "A lighter mineral profile tuned for mid-day pacing — restorative without stimulant lift.",
      },
    ],
    usage: [
      "Stir one sachet into 500 ml cold water.",
      "Ideal as a mid-afternoon reset, between meals.",
      "One sachet per day. Do not exceed.",
    ],
    supplementFacts: [
      { label: "Calories", amount: "10 kcal" },
      { label: "Total Carbohydrate", amount: "2 g", dv: "1%" },
      { label: "Sodium", amount: "320 mg", dv: "14%" },
      { label: "Potassium", amount: "180 mg", dv: "4%" },
      { label: "Magnesium", amount: "50 mg", dv: "12%" },
      { label: "Vitamin E", amount: "15 mg", dv: "100%" },
      { label: "Biotin", amount: "30 mcg", dv: "100%" },
      { label: "Zinc", amount: "8 mg", dv: "73%" },
      { label: "Hyaluronic Acid", amount: "80 mg", dv: "—" },
    ],
  },
  {
    id: "lemon",
    slug: "lemon-zest",
    position: "right",
    name: "Lemon Zest",
    flavour: "Lemon",
    tagline: "Pure clarity.",
    description:
      "A clean, focusing daily ritual — Mediterranean lemon, magnesium, and a calm B-complex for sustained mental clarity.",
    image: "/mock-lemon-30.png",
    accent: "#FADC33",
    trioCta: "Explore Ritual",
    price: 42,
    priceLabel: "$42",
    servings: 30,
    ingredients: [
      "Mediterranean lemon extract",
      "Sodium · Potassium · Magnesium glycinate",
      "Vitamin C (ascorbic acid)",
      "B-complex (B1 · B3 · B6 · B12)",
      "L-theanine",
      "Ginger root",
    ],
    benefits: [
      {
        label: "Hydration",
        copy:
          "A crisp electrolyte profile with magnesium glycinate — restorative, gentle on the stomach, fast-acting.",
      },
      {
        label: "Vitamins",
        copy:
          "A full B-complex paired with Vitamin C — the substrate for steady energy and clearer hours.",
      },
      {
        label: "Clarity",
        copy:
          "L-theanine and ginger soften the curve — focus without the spike, alertness without the crash.",
      },
    ],
    usage: [
      "Stir one sachet into 500 ml cold water.",
      "Best taken on waking or mid-morning.",
      "One sachet per day. Do not exceed.",
    ],
    supplementFacts: [
      { label: "Calories", amount: "10 kcal" },
      { label: "Total Carbohydrate", amount: "2 g", dv: "1%" },
      { label: "Sodium", amount: "350 mg", dv: "15%" },
      { label: "Potassium", amount: "200 mg", dv: "4%" },
      { label: "Magnesium", amount: "75 mg", dv: "18%" },
      { label: "Vitamin C", amount: "90 mg", dv: "100%" },
      { label: "Vitamin B1", amount: "1.2 mg", dv: "100%" },
      { label: "Vitamin B6", amount: "1.7 mg", dv: "100%" },
      { label: "Vitamin B12", amount: "2.4 mcg", dv: "100%" },
      { label: "L-Theanine", amount: "100 mg", dv: "—" },
    ],
  },
];

export function getProduct(slug: ProductSlug): Product {
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product slug: ${slug}`);
  return product;
}

/* ─── The Curation — bundle pricing ─────────────────────────────────────── */
export const curation = {
  slug: "the-curation" as const,
  name: "The Curation",
  tagline: "All three rituals.",
  description:
    "The full collection — strawberry, lychee, lemon. Three flavours, three rituals, one month of considered daily wellness.",
  /* Bundle math: 3 × $42 = $126 list, $108 bundle = $18 savings. */
  listPrice: 126,
  listPriceLabel: "$126",
  bundlePrice: 108,
  bundlePriceLabel: "$108",
  savingsLabel: "Save $18",
  accent: "#3D1322", // oxblood — neutral premium tone for the bundle
};
