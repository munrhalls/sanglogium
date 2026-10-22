// F1 — the single shared URL-param contract for catalogue filters & sorting.
//
// This module is the ONE source of truth for every filter/sort query-param key,
// its value type, its default, and its parse/serialize rules. F2–F6 (the visible
// controls) and V1/V2 (the surfaces) import their parsers from here so the URL
// vocabulary can never drift between producers and consumers.
//
// HEADLESS: no JSX, no data access. It does not know about the product grid,
// product data, result counts, or streaming. The controls never call the
// grid: a filter/sort write updates the URL with shallow:false and the
// catalogue RSC re-renders the grid (see FILTER_SORT_URL_OPTIONS below).
//
// This is a deliberate fresh design for the client-only display-sync needs of the
// F-layer. The deleted {filterParams,sortParams,searchParams}.ts
// encoded the OLD removed server-driven system (compound `?f=brand:x` syntax, a
// server-side sort allowlist, `shallow:false` + `router.replace` to force an RSC
// refetch) — do NOT revive their schema or routing model.
//
// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT
// ─────────────────────────────────────────────────────────────────────────────
//
// Param keys (chosen to never clash with params already parsed on the catalogue
// routes: `page` on /products and /products/[...slug], `q` on /search, `drawer`
// globally):
//
//   sort      — string, one of SORT_OPTIONS values. Default "newest".
//   minPrice  — integer, DOLLARS (not cents). Absent = no lower bound.
//   maxPrice  — integer, DOLLARS (not cents). Absent = no upper bound.
//   inStock   — boolean. Default false ("show everything").
//   brand     — array of brand slugs, comma-separated. Default [] (no filter).
//               `brand` is the checkbox facet group F5 ships; any further facet
//               group follows the same array-of-string shape with its own key.
//
// Clean-URL rule: a param sitting at its default NEVER appears in the URL. Every
// parser sets an explicit default and relies on nuqs `clearOnDefault` (on by
// default in v2) — `sort=featured`, `inStock=false` and `brand=` (empty) all
// serialize to the key being absent. `minPrice` /
// `maxPrice` have no "default value": absent simply means unbounded, so a null
// write removes them. This keeps faceted URLs clean and keeps
// features/catalogue/core/rules/seo.ts `isFacetedQuery` honest (it keys off `page`, which this
// layer leaves alone except via the page-reset helper below).
//
// Price unit: the URL carries whole DOLLARS. Product `price_data.unit_amount` is
// cents and the slider UI works in dollars (features/product-filtering/core/rules/priceBounds.ts,
// platform/utils/price.ts). F3 converts at the edges; the URL never carries cents.
//
// History mode: discrete controls (sort, inStock, brand) use
// `history: "push"` so a single change is individually reversible with the
// browser Back button (and re-applied with Forward). The price range is a
// continuous drag — F3 owns its debounce and should write with
// `history: "replace"` so a drag does not flood the history stack. Both use
// `shallow: false` (S1 — sang-logium-ytc): a filter/sort change must notify the
// server so the catalogue RSC re-renders the product grid. The write is wrapped
// in a React transition, so the navigation does not trip
// `loading.tsx` and the filter sidebar stays mounted.
//
// Param preservation: consumers write through nuqs, which MERGES into the
// existing query string — unrelated params (`?q=` from search, `?page=` from
// pagination) are always left untouched.
//
// Page reset: a filter/sort change invalidates the current page number. Consumers
// call `pageResetOnFilterChange` (see below) alongside their own setter so
// changing any filter/sort sends the user back to page 1.

// Import parsers + loader/serializer from `nuqs/server`: this module is consumed
// by both the catalogue RSC pages (via `loadFilterSort`) and the client controls
// (via `filterSortParsers`). `nuqs/server` re-exports every parser and carries no
// "use client" boundary, so the shared parser map is safe on both sides. The
// client hooks (`useQueryState` etc.) still come from `nuqs` in state/useFilterParam.ts.
import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  createParser,
  parseAsFloat,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

// Facet param keys come from the same selector the facets themselves do, so a
// facet can never exist without its URL grammar. The parser *shape* is static:
// parsers are built on the client before any product data exists. Which values
// are legal is decided per request by sanitizeFilterState, not here.
import {
  SORT_DEFAULT,
  SORT_OPTIONS as SORT_MAP,
  type SortValue,
} from "@/features/product-filtering/core/definitions/sortOptions";
import {
  FACET_SELECTOR,
  QUERY_ONLY_FACETS,
} from "@/features/product-filtering/core/definitions/facetSelector";
import type { ProductQueryState } from "@/features/product-filtering/core/types/filterTypes";
export type { SortValue } from "@/features/product-filtering/core/definitions/sortOptions";

// Fixed sort allowlist. `value` goes in the URL; `label` is for the controls.
// SortValue is derived directly from the canonical sort-map tuple so only the
// URL values declared in sortOptions.ts are valid.
export { SORT_DEFAULT };

const SORT_VALUES = SORT_MAP.map((o) => o.urlValue) as SortValue[];


// Params whose value is a single boolean rather than a list — the one shape
// the selector cannot express, since control kinds are data-derived at request
// time while this parser map is static.
export const FILTER_BOOLEAN_PARAMS = new Set([
  "inStock",
  "microphone",
  "requiresAmplifier",
  "portable",
  "foldable",
  "dacIncluded",
  "balancedOutput",
  "detachableCable",
]);

// Build parsers for every selected and query-only facet, keyed by facet id.
// Range facets (selector entries carrying a `unit`) get two float parsers each
// -- `${id}Min`/`${id}Max` -- mirroring the minPrice/maxPrice shape: no
// default, absent means unbounded.
function parserForParam(id: string, unit?: string) {
  if (unit) {
    return { [`${id}Min`]: parseAsFloat, [`${id}Max`]: parseAsFloat };
  }
  if (FILTER_BOOLEAN_PARAMS.has(id)) {
    return { [id]: parseAsBoolean.withDefault(false) };
  }
  // Checkbox facets are stored as arrays of strings in the URL.
  return { [id]: parseAsArrayOf(parseAsString).withDefault([]) };
}

const facetParsers: Record<string, any> = {};
for (const selector of Object.values(FACET_SELECTOR)) {
  for (const facet of selector.facets) {
    Object.assign(facetParsers, parserForParam(facet.id, facet.unit));
  }
}
for (const facet of QUERY_ONLY_FACETS) {
  Object.assign(facetParsers, parserForParam(facet.id));
}

/**
 * The parser map — the single source of truth. Imported by both the server
 * `loadFilterSort` loader and every client control, so a deep link and the
 * control that reads it can never disagree.
 */
// parseAsInteger is parseInt: it reads "1.2.3" as 1. Prices accept whole numbers only.
const parseAsWholeNumber = createParser({
  parse: (value) => (/^-?\d+$/.test(value) ? Number(value) : null),
  serialize: (value) => String(Math.round(value)),
});

export const filterSortParsers = {
  // Junk / unknown values fall through to the default (parseAsStringLiteral
  // returns null for anything off the list; `.withDefault` then supplies
  // "featured"). Never written back.
  sort: parseAsStringLiteral(SORT_VALUES).withDefault(SORT_DEFAULT),

  // Dollars, integer. No default: absent = unbounded. Non-numeric → null.
  minPrice: parseAsWholeNumber,
  maxPrice: parseAsWholeNumber,

  ...facetParsers,
};

/** Every key this contract owns — useful for "clear all" and chip enumeration. */
const FILTER_SORT_KEYS = Object.keys(filterSortParsers) as Array<
  keyof typeof filterSortParsers
>;

/**
 * Shared nuqs options for the discrete controls (sort, inStock, brand).
 * F3's price control overrides `history` to "replace".
 *
 * `shallow: false` (S1 — sang-logium-ytc): a filter/sort write notifies the
 * server so the catalogue RSC re-renders the grid with the new order/predicate.
 * The write stays wrapped in a React transition (see ui/useFilterParam.ts),
 * so this is a transition-driven navigation: `loading.tsx` does NOT fire, the
 * sidebar stays mounted, the grid refetches quietly in the background.
 */
export const FILTER_SORT_URL_OPTIONS = {
  history: "push",
  shallow: false,
  scroll: false,
} as const;

/** The pagination param a filter/sort change must reset. */
export const PAGE_PARAM_KEY = "page";

/**
 * Server loader: parse the catalogue filter/sort state out of a Next.js
 * `searchParams` object (or a URLSearchParams / query string). Matches
 * `filterSortParsers` exactly, so SSR and the first client render agree.
 */
export const loadFilterSort = createLoader(filterSortParsers);

/**
 * Serialize a (partial) filter/sort state back to a query string, honouring the
 * clean-URL rule. Pass a base URL/searchParams to merge into an existing query.
 */
export const serializeFilterSort = createSerializer(filterSortParsers);

/**
 * Whether any filter or non-default sort is currently active — drives the
 * EmptyResults "no results because of your filters" vs. "no products in this
 * category at all" messaging. Single source of truth (sang-logium-3rv.12
 * follow-up): app/(store)/products/page.tsx and app/(store)/products/
 * [...slug]/page.tsx each independently hand-wrote an equivalent check
 * before, and sang-logium-3rv.5 already had to fix the same bug in both
 * copies separately once — the same drift risk this file's header comment
 * already calls out (S1, risk A2) for the query itself.
 */
export function isFiltersActive(state: ProductQueryState): boolean {
  return FILTER_SORT_KEYS.some((key) => {
    if (key === 'sort') return state.sort !== SORT_DEFAULT;
    if (key === 'minPrice' || key === 'maxPrice') return state[key] != null;
    const value = state[key];
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    return value === true;
  });
}
