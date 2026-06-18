// # Test Matrix: Filters & Sorting Gap-Closure
//
// Living checklist of pending specs for every phase/task in
// `filters-sorting-gap-closure-plan.md`. All entries are `it.todo` placeholders
// (zero run cost) and are replaced by real specs as each phase is implemented.
//
// Each todo is tagged with the gap ID(s) and task it covers.

import { describe, it } from "vitest";

describe("Filters & Sorting — Phase 1: Trusted Param & Sort Contract", () => {
  it.todo("round-trips f-param values containing ':' and ',' without corruption [B4,B12 / T1.1]");
  it.todo("resolveSort returns safe groqField/groqDir for known sort values [A6 / T1.2]");
  it.todo("resolveSort falls back to default for unknown or crafted sort values [B1 / T1.2]");
  it.todo("getProductsByVfsKeys never interpolates a raw sort field into the GROQ order clause [B1 / T1.4]");
  it.todo("page.tsx parses sort/f/page via the shared loader, not ad-hoc parsing [A3 / T1.3]");
  it.todo("client hook and server page import the same param parsers [A3,B12 / T1.5]");
  it.todo("SortDropdown renders its options from the SORT_OPTIONS config [A6 / T1.6]");
  it.todo("active filter count reflects logical filters regardless of wire encoding [A8 / T1.7]");
});

describe("Filters & Sorting — Phase 2: Query Resilience & Performance", () => {
  it.todo("getProductsByVfsKeys returns an empty result and logs on Sanity failure [B2 / T2.1]");
  it.todo("getFiltersForCategoryPath returns a safe empty shape on Sanity failure [B2 / T2.1]");
  it.todo("getFiltersForCategoryPath issues its independent queries concurrently [A5 / T2.2]");
  it.todo("derives distinct brands without fetching every product in the category [A5 / T2.3]");
});

describe("Filters & Sorting — Phase 3: Pagination & Result Count", () => {
  it.todo("returns the correct product window for a given page [A1 / T3.1]");
  it.todo("applies sort before slicing the page window [A1 / T3.1]");
  it.todo("returns the full filtered total count, not the capped window [A1 / T3.2]");
  it.todo("reads the page param and clamps out-of-range pages [A1 / T3.3]");
  it.todo("pagination UI reaches all products in a >100-item category [A1 / T3.4]");
});

describe("Filters & Sorting — Phase 4: Deterministic & Featured Ordering", () => {
  it.todo("product schema exposes a displayPriority field [A2 / T4.1]");
  it.todo("featured sort orders by displayPriority desc then _createdAt desc [A2 / T4.2]");
  it.todo("featured order is deterministic when displayPriority is unset [A2 / T4.2]");
});

describe("Filters & Sorting — Phase 5: Filter Correctness & Data Semantics", () => {
  it.todo("strips unknown filters before querying [B3 / T5.1]");
  it.todo("normalizes or ignores an inverted min>max price range [B5 / T5.2]");
  it.todo("derives slider bounds from real data and honors a 0 bound [B6 / T5.3]");
  it.todo("stock-minimum filter matches availableStock [B7 / T5.4]");
  it.todo("brand option intersection is case-insensitive [B9 / T5.5]");
  it.todo("clears stale filters and page on category change [B13 / T5.6]");
});

describe("Filters & Sorting — Phase 6: UX States & Feedback", () => {
  it.todo("shows an empty-results state with a working reset CTA [A4 / T6.1]");
  it.todo("shows a pending state on re-filter and manages scroll position [A7 / T6.2]");
});

describe("Filters & Sorting — Phase 7: Interaction Consistency & Accessibility", () => {
  it.todo("debounces stock slider updates like the price slider [B8 / T7.1]");
  it.todo("commits keyboard step changes via the debounced path [B10 / T7.2]");
  it.todo("mobile drawer keeps a live focus trap and exposes aria-expanded/aria-controls [B11 / T7.3]");
  it.todo("active filter chips expose descriptive aria-labels [B11 / T7.3]");
});

describe("Filters & Sorting — Phase 8: SEO / Indexation of Facets", () => {
  it.todo("facet URLs canonicalize to the base category [A9 / T8.1]");
  it.todo("non-indexable facet permutations carry robots controls [A9 / T8.1]");
  it.todo("base category listing order is stable across crawls [A9 / T8.2]");
});
