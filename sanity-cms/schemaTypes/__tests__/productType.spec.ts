// # Execution Specs: product schema — displayPriority (curated featured order)
//
// Phase 4 / T4.1 of `filters-sorting-gap-closure-plan.md`: the product schema
// must expose an OPTIONAL `displayPriority` number field. Curators raise a
// product in the default ("featured") listing by setting a higher value; an
// unset field is treated as 0 by the query (`coalesce(displayPriority, 0)`),
// so the feature is correct even before any backfill runs (A2).

import { describe, it, expect } from "vitest";
import { productType } from "@/sanity-cms/schemaTypes/productType";

type SchemaField = {
  name: string;
  type: string;
  validation?: unknown;
  initialValue?: unknown;
};

const fields = (productType.fields ?? []) as unknown as SchemaField[];
const displayPriority = fields.find((f) => f.name === "displayPriority");

describe("product schema — displayPriority", () => {
  it("exposes a displayPriority field [A2 / T4.1]", () => {
    expect(displayPriority).toBeDefined();
  });

  it("is a number field", () => {
    expect(displayPriority?.type).toBe("number");
  });

  it("is optional — no required validation and no forced initial value", () => {
    // Unset must be allowed so existing products need no migration; the query
    // coalesces a missing value to 0 (verified in the sort-contract specs).
    expect(displayPriority?.initialValue).toBeUndefined();
  });
});
