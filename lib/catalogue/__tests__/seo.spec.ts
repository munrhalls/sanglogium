import { describe, it, expect } from "vitest";
import { isFacetedQuery, canonicalCategoryPath } from "@/lib/catalogue/seo";

describe("catalogue SEO helpers (A9 / T8.1)", () => {
  it("treats f / sort / page>1 as faceted (non-indexable)", () => {
    expect(isFacetedQuery({ f: "brand:Focal" })).toBe(true);
    expect(isFacetedQuery({ sort: "name:asc" })).toBe(true);
    expect(isFacetedQuery({ page: "2" })).toBe(true);
  });
  it("treats the bare base category (and page=1) as indexable", () => {
    expect(isFacetedQuery({})).toBe(false);
    expect(isFacetedQuery({ page: "1" })).toBe(false);
  });
  it("builds the canonical path from the slug segments", () => {
    expect(canonicalCategoryPath(["audio-electronics", "headphones"]))
      .toBe("/products/audio-electronics/headphones");
  });
});
