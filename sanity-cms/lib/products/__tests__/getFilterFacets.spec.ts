// sang-logium-3rv.12 follow-up — direct correctness tests for
// productMatchesState and its helpers: the in-memory matching engine that
// computes every facet count and option on /products/headphones (and the
// other two catalogue categories). Previously zero test coverage, despite
// this being the function that decides, for every shopper-visible count,
// whether a product counts as a match. See docs/filters-sort/
// audit-headphones-professional-readiness.md, Gap 4.
//
// This file does not attempt to prove productMatchesState and
// buildProductQuery.ts (the GROQ predicate builder) always agree — one emits
// a query string later interpreted by Sanity, the other evaluates directly
// in JS, so there is no shared runtime to assert equivalence against without
// either a GROQ interpreter or a live Sanity call. Instead, each engine gets
// its own direct correctness coverage — this file for the in-memory one,
// lib/catalogue/__tests__/buildProductQuery.spec.ts for the GROQ one.

import { describe, it, expect } from "vitest";
import {
  productMatchesState,
  getPriceCents,
  isInStock,
  valuesForFacet,
  numericValueForRangeFacet,
  type RawProduct,
} from "@/sanity-cms/lib/products/getFilterFacets";
import { FILTER_FACETS } from "@/lib/catalogue/facetMap";
import type { ProductQueryState } from "@/lib/catalogue/buildProductQuery";

const wearingStyleFacet = FILTER_FACETS.find((f) => f.urlParam === "wearingStyle")!;
const connectivityFacet = FILTER_FACETS.find((f) => f.urlParam === "connectivity")!;
const impedanceFacet = FILTER_FACETS.find((f) => f.urlParam === "impedance")!;

function baseState(overrides: Record<string, unknown> = {}): ProductQueryState {
  return {
    sort: "featured",
    minPrice: null,
    maxPrice: null,
    inStock: false,
    ...overrides,
  } as ProductQueryState;
}

describe("getPriceCents", () => {
  it("prefers filterAttributes.price over the legacy price field", () => {
    expect(getPriceCents({ _id: "1", filterAttributes: { price: 15000 }, price: 9999 })).toBe(15000);
  });
  it("falls back to the legacy price field when filterAttributes.price is absent", () => {
    expect(getPriceCents({ _id: "1", price: 9999 })).toBe(9999);
  });
  it("returns null when neither is present", () => {
    expect(getPriceCents({ _id: "1" })).toBeNull();
  });
});

describe("isInStock", () => {
  it("prefers an explicit filterAttributes.inStock", () => {
    expect(isInStock({ _id: "1", filterAttributes: { inStock: false }, stock: 10, reservedStock: 0 })).toBe(false);
  });
  it("falls back to stock minus reservedStock when filterAttributes.inStock is absent", () => {
    expect(isInStock({ _id: "1", stock: 5, reservedStock: 2 })).toBe(true);
    expect(isInStock({ _id: "1", stock: 2, reservedStock: 2 })).toBe(false);
  });
});

describe("valuesForFacet", () => {
  it("lowercases and wraps a scalar field", () => {
    expect(valuesForFacet({ _id: "1", filterAttributes: { connectivity: "Wireless" } }, connectivityFacet)).toEqual(["wireless"]);
  });
  it("lowercases every entry of an array field", () => {
    expect(valuesForFacet({ _id: "1", filterAttributes: { wearingStyle: ["Over-Ear"] } }, wearingStyleFacet)).toEqual(["over-ear"]);
  });
  it("returns an empty array when the field is missing", () => {
    expect(valuesForFacet({ _id: "1" }, wearingStyleFacet)).toEqual([]);
  });
});

describe("numericValueForRangeFacet", () => {
  it("reads a top-level numeric field", () => {
    expect(numericValueForRangeFacet({ _id: "1", filterAttributes: { impedanceOhms: 32 } }, impedanceFacet)).toBe(32);
  });
  it("returns null when the field is missing", () => {
    expect(numericValueForRangeFacet({ _id: "1" }, impedanceFacet)).toBeNull();
  });
});

describe("productMatchesState — price", () => {
  const product: RawProduct = { _id: "1", filterAttributes: { price: 15000 } }; // $150.00

  it("matches inside the range", () => {
    expect(productMatchesState(product, baseState({ minPrice: 100, maxPrice: 200 }))).toBe(true);
  });
  it("excludes below the minimum", () => {
    expect(productMatchesState(product, baseState({ minPrice: 200 }))).toBe(false);
  });
  it("excludes above the maximum", () => {
    expect(productMatchesState(product, baseState({ maxPrice: 100 }))).toBe(false);
  });
  it("excludeParam skips the minimum check (disjunctive-count support)", () => {
    expect(productMatchesState(product, baseState({ minPrice: 200 }), "minPrice")).toBe(true);
  });
});

describe("productMatchesState — inStock", () => {
  it("excludes an out-of-stock product when inStock is active", () => {
    const product: RawProduct = { _id: "1", filterAttributes: { inStock: false } };
    expect(productMatchesState(product, baseState({ inStock: true }))).toBe(false);
  });
  it("does not filter on stock when inStock is inactive", () => {
    const product: RawProduct = { _id: "1", filterAttributes: { inStock: false } };
    expect(productMatchesState(product, baseState({ inStock: false }))).toBe(true);
  });
});

describe("productMatchesState — boolean facet", () => {
  it("excludes a product missing the flag when the facet is active", () => {
    const product: RawProduct = { _id: "1", filterAttributes: {} };
    expect(productMatchesState(product, baseState({ microphone: true }))).toBe(false);
  });
  it("includes every product when the facet is inactive", () => {
    const product: RawProduct = { _id: "1", filterAttributes: {} };
    expect(productMatchesState(product, baseState({ microphone: false }))).toBe(true);
  });
});

describe("productMatchesState — range facet", () => {
  const product: RawProduct = { _id: "1", filterAttributes: { impedanceOhms: 32 } };

  it("matches above a minimum bound", () => {
    expect(productMatchesState(product, baseState({ impedanceMin: 16 }))).toBe(true);
  });
  it("excludes below a minimum bound", () => {
    expect(productMatchesState(product, baseState({ impedanceMin: 50 }))).toBe(false);
  });
  it("excludes a product missing the field when a bound is active", () => {
    const missing: RawProduct = { _id: "2", filterAttributes: {} };
    expect(productMatchesState(missing, baseState({ impedanceMin: 16 }))).toBe(false);
  });
});

describe("productMatchesState — multi facet (array field)", () => {
  it("matches on overlap, case-insensitively", () => {
    const product: RawProduct = { _id: "1", filterAttributes: { wearingStyle: ["Over-Ear"] } };
    expect(productMatchesState(product, baseState({ wearingStyle: ["over-ear", "on-ear"] }))).toBe(true);
  });
  it("excludes when there is no overlap", () => {
    const product: RawProduct = { _id: "1", filterAttributes: { wearingStyle: ["in-ear"] } };
    expect(productMatchesState(product, baseState({ wearingStyle: ["over-ear"] }))).toBe(false);
  });
});

describe("productMatchesState — excludeParam (disjunctive counts)", () => {
  const state = baseState({ wearingStyle: ["over-ear"], connectivity: ["wireless"] });
  const product: RawProduct = {
    _id: "1",
    filterAttributes: { wearingStyle: ["in-ear"], connectivity: "wireless" },
  };

  it("fails the full state (does not match wearingStyle)", () => {
    expect(productMatchesState(product, state)).toBe(false);
  });
  it("passes when wearingStyle is excluded from the check — this is what makes the wearingStyle option's own displayed count honest", () => {
    expect(productMatchesState(product, state, "wearingStyle")).toBe(true);
  });
});

describe("productMatchesState — unmigrated product (no filterAttributes)", () => {
  const product: RawProduct = { _id: "1" };

  it("matches when no facet filters are active", () => {
    expect(productMatchesState(product, baseState())).toBe(true);
  });
  it("is excluded once any facet filter is active", () => {
    expect(productMatchesState(product, baseState({ wearingStyle: ["over-ear"] }))).toBe(false);
  });
});
