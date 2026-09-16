// sang-logium-3rv.12 follow-up — direct correctness tests for
// buildProductQuery.ts, the single GROQ predicate builder shared by every
// /products/* route. Previously zero test coverage. Companion to
// sanity-cms/lib/products/__tests__/getFilterFacets.spec.ts, which covers the
// separate in-memory matching engine — see that file's header for why the two
// are not tested for behavioural equivalence against each other (different
// execution targets: a GROQ string vs a JS interpreter).
//
// The price and inStock assertions here are a deliberate regression guard:
// sang-logium-3rv.5's own risk assessment flagged this exact file as able to
// silently break price filtering on all three catalogue pages if a future
// range-facet or vocab change accidentally touches the price-specific branch.

import { describe, it, expect } from "vitest";
import { buildProductQuery, isFiltersActive, type ProductQueryState } from "@/lib/catalogue/buildProductQuery";

function baseState(overrides: Record<string, unknown> = {}): ProductQueryState {
  return {
    sort: "featured",
    minPrice: null,
    maxPrice: null,
    inStock: false,
    ...overrides,
  } as ProductQueryState;
}

describe("buildProductQuery — empty state", () => {
  it("produces no extra predicate and the default order", () => {
    const { whereClause, params, orderClause } = buildProductQuery(baseState());
    expect(whereClause).toBe("");
    expect(params).toEqual({});
    expect(orderClause).toContain("featuredPriority");
  });
});

describe("buildProductQuery — price (regression guard)", () => {
  it("converts dollars to cents against filterAttributes.price with a legacy fallback", () => {
    const { whereClause, params } = buildProductQuery(baseState({ minPrice: 100, maxPrice: 200 }));
    expect(whereClause).toContain("coalesce(filterAttributes.price, price_data.unit_amount) >= $minCents");
    expect(whereClause).toContain("coalesce(filterAttributes.price, price_data.unit_amount) <= $maxCents");
    expect(params.minCents).toBe(10000);
    expect(params.maxCents).toBe(20000);
  });
});

describe("buildProductQuery — inStock (regression guard)", () => {
  it("coalesces filterAttributes.inStock with the legacy stock arithmetic", () => {
    const { whereClause } = buildProductQuery(baseState({ inStock: true }));
    expect(whereClause).toContain("coalesce(filterAttributes.inStock, stock - reservedStock > 0) == true");
  });
  it("adds no predicate when inStock is false", () => {
    const { whereClause } = buildProductQuery(baseState({ inStock: false }));
    expect(whereClause).not.toContain("inStock");
  });
});

describe("buildProductQuery — boolean facet", () => {
  it("adds an exact-equality predicate when active", () => {
    const { whereClause } = buildProductQuery(baseState({ microphone: true }));
    expect(whereClause).toContain("filterAttributes.microphone == true");
  });
  it("adds nothing when inactive", () => {
    const { whereClause } = buildProductQuery(baseState({ microphone: false }));
    expect(whereClause).not.toContain("microphone");
  });
});

describe("buildProductQuery — range facet", () => {
  it("adds min/max predicates generically, without touching the price branch", () => {
    const { whereClause, params } = buildProductQuery(baseState({ impedanceMin: 16, impedanceMax: 300 }));
    expect(whereClause).toContain("filterAttributes.impedanceOhms >= $impedanceMinParam");
    expect(whereClause).toContain("filterAttributes.impedanceOhms <= $impedanceMaxParam");
    expect(params.impedanceMinParam).toBe(16);
    expect(params.impedanceMaxParam).toBe(300);
  });
  it("supports a nested field path (bass extension -> freqResponseHz.min)", () => {
    const { whereClause } = buildProductQuery(baseState({ bassExtensionMin: 10 }));
    expect(whereClause).toContain("filterAttributes.freqResponseHz.min >= $bassExtensionMinParam");
  });
});

describe("buildProductQuery — multi facet (array field)", () => {
  it("emits a case-insensitive array-overlap predicate", () => {
    const { whereClause, params } = buildProductQuery(baseState({ wearingStyle: ["over-ear", "on-ear"] }));
    expect(whereClause).toContain("count(coalesce(filterAttributes.wearingStyle, [])[lower(@) in $wearingStyleParam]) > 0");
    expect(params.wearingStyleParam).toEqual(["over-ear", "on-ear"]);
  });
});

describe("buildProductQuery — enum facet (scalar field)", () => {
  it("emits a case-insensitive scalar-in predicate", () => {
    const { whereClause, params } = buildProductQuery(baseState({ connectivity: ["wireless"] }));
    expect(whereClause).toContain("coalesce(lower(filterAttributes.connectivity), '') in $connectivityParam");
    expect(params.connectivityParam).toEqual(["wireless"]);
  });
});

describe("buildProductQuery — sort", () => {
  it("every sort value produces its documented order clause", () => {
    const expectations: Array<[string, string]> = [
      ["featured", "featuredPriority"],
      ["best-selling", "sortAttributes.popularity"],
      ["price-asc", "price_data.unit_amount asc"],
      ["price-desc", "price_data.unit_amount desc"],
      ["newest", "_createdAt desc"],
    ];
    for (const [sort, expectedFragment] of expectations) {
      const { orderClause } = buildProductQuery(baseState({ sort }));
      expect(orderClause, `sort=${sort}`).toContain(expectedFragment);
    }
  });
});

// sang-logium-3rv.12 follow-up — app/(store)/products/page.tsx and
// app/(store)/products/[...slug]/page.tsx each independently hand-wrote an
// equivalent "is any filter active" check before (one driven by iterating
// FILTER_SORT_KEYS, the other by Object.entries(state) — equivalent given
// nuqs's loader always populates every declared key, but two hand-written
// copies of the same rule all the same). sang-logium-3rv.5 already had to
// fix the same empty-state-message bug in both copies separately once. Now a
// single shared function, tested directly here for the first time.
describe("isFiltersActive", () => {
  it("is false for the default state", () => {
    expect(isFiltersActive(baseState())).toBe(false);
  });
  it("is true when sort is non-default", () => {
    expect(isFiltersActive(baseState({ sort: "newest" }))).toBe(true);
  });
  it("is true when a price bound is set", () => {
    expect(isFiltersActive(baseState({ minPrice: 50 }))).toBe(true);
  });
  it("is true when inStock is set", () => {
    expect(isFiltersActive(baseState({ inStock: true }))).toBe(true);
  });
  it("is true when a range facet bound is set", () => {
    expect(isFiltersActive(baseState({ impedanceMin: 16 }))).toBe(true);
  });
  it("is true when a checkbox facet has a selection", () => {
    expect(isFiltersActive(baseState({ wearingStyle: ["over-ear"] }))).toBe(true);
  });
  it("is false when a checkbox facet key is present but empty", () => {
    expect(isFiltersActive(baseState({ wearingStyle: [] }))).toBe(false);
  });
});
