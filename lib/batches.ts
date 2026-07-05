/* ─── Batch registry — the evidence behind /standards ──────────────────────
   One record per production lot. The lot number is printed on every box and
   resolves at /ritual/<lot> (QR target) and via the lookup on /standards.

   ⚠ PLACEHOLDER DATA: the pilot entries below describe the formulation
   pilot; replace the test details with the actual lab values and attach the
   real COA PDFs (drop in /public/coa/, set `coaUrl`) as each production
   batch clears testing. Never publish a value the lab report doesn't show. */

import type { ProductSlug } from "@/lib/products";

export interface BatchTest {
  panel: string;
  result: "Pass" | "Pending";
  detail: string;
}

export interface Batch {
  /** Lot number printed on the box, e.g. NVY-ST-2606. Uppercase. */
  lot: string;
  flavourSlug: ProductSlug;
  stage: "Pilot" | "Production";
  /** ISO date of production. */
  produced: string;
  facility: string;
  lab: string;
  /** ISO date the lab report was issued. */
  tested: string;
  tests: BatchTest[];
  /** Public COA PDF (in /public/coa/) once the real report exists. */
  coaUrl?: string;
}

const PILOT_TESTS: BatchTest[] = [
  {
    panel: "Heavy metals",
    result: "Pass",
    detail: "Lead, arsenic, cadmium, mercury — below USP <2232> limits",
  },
  {
    panel: "Microbial load",
    result: "Pass",
    detail: "Total plate count, yeast & mold, E. coli, Salmonella — absent",
  },
  {
    panel: "Label accuracy",
    result: "Pass",
    detail: "Actives assayed within ±10% of declared amounts",
  },
  {
    panel: "Pesticide residues",
    result: "Pass",
    detail: "Multi-residue screen — none detected",
  },
];

export const batches: Batch[] = [
  {
    lot: "NVY-ST-2606",
    flavourSlug: "strawberry-surge",
    stage: "Pilot",
    produced: "2026-06-12",
    facility: "cGMP partner facility, California",
    lab: "Independent ISO/IEC 17025 laboratory",
    tested: "2026-06-24",
    tests: PILOT_TESTS,
  },
  {
    lot: "NVY-LY-2606",
    flavourSlug: "lychee-lush",
    stage: "Pilot",
    produced: "2026-06-12",
    facility: "cGMP partner facility, California",
    lab: "Independent ISO/IEC 17025 laboratory",
    tested: "2026-06-24",
    tests: PILOT_TESTS,
  },
  {
    lot: "NVY-LE-2606",
    flavourSlug: "lemon-zest",
    stage: "Pilot",
    produced: "2026-06-12",
    facility: "cGMP partner facility, California",
    lab: "Independent ISO/IEC 17025 laboratory",
    tested: "2026-06-24",
    tests: PILOT_TESTS,
  },
];

/** Case/whitespace-tolerant lookup by printed lot number. */
export function findBatch(lot: string): Batch | undefined {
  const needle = lot.trim().toUpperCase().replace(/\s+/g, "");
  return batches.find((b) => b.lot === needle);
}
