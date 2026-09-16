// POC-local mirror of lib/catalogue/filterSortParams.ts ("F1") — the single
// shared URL-param contract for this page's filters & sort, re-pointed at
// facetConfig.ts's should-be.md taxonomy instead of the production facet set.
//
// Same contract rules as production, deliberately kept identical:
//  - one parser per facet, keyed by its `id` (checkbox/enum -> array of
//    strings, boolean -> boolean withDefault(false))
//  - clean-URL: a param at its default never appears in the URL (nuqs
//    clearOnDefault)
//  - `sort` -> string literal from SORT_VALUES, default "featured"
//  - `minPrice`/`maxPrice`, `minRating`, and one min/max pair per range facet
//    -> floats, no default (absent = unbounded)
//  - HEADLESS: no JSX, no data access.

import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';
import { FACETS, SORT_DEFAULT, SORT_VALUES, type FacetDef, type SortValue } from './facetConfig';

function parserForFacet(facet: FacetDef) {
  if (facet.control === 'boolean') return parseAsBoolean.withDefault(false);
  return parseAsArrayOf(parseAsString).withDefault([]);
}

const facetParsers: Record<string, ReturnType<typeof parserForFacet>> = {};
const rangeMinMaxParsers: Record<string, typeof parseAsFloat> = {};

for (const facet of FACETS) {
  if (facet.control === 'range') {
    rangeMinMaxParsers[`${facet.id}Min`] = parseAsFloat;
    rangeMinMaxParsers[`${facet.id}Max`] = parseAsFloat;
    continue;
  }
  facetParsers[facet.id] = parserForFacet(facet);
}

export const filterSortParsers = {
  sort: parseAsStringLiteral(SORT_VALUES).withDefault(SORT_DEFAULT),

  // Price (item 2) — bespoke, dollars, no default (absent = unbounded).
  minPrice: parseAsFloat,
  maxPrice: parseAsFloat,

  // Customer rating (item 3) — bespoke single-select threshold ("4★ & up").
  minRating: parseAsFloat,

  ...facetParsers,
  ...rangeMinMaxParsers,
};

// Manually-authored shape (not derived from the parser internals — mirrors
// production's ProductQueryState in lib/catalogue/buildProductQuery.ts) so RSC
// and client agree without reaching into nuqs's parser types.
export interface FilterSortState {
  sort: SortValue;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  [key: string]: unknown;
}

export const FILTER_SORT_KEYS = Object.keys(filterSortParsers) as Array<keyof typeof filterSortParsers>;

/** Shared nuqs options — identical to production's FILTER_SORT_URL_OPTIONS.
 *  shallow:false so a write triggers the RSC re-render that refetches the
 *  filtered/sorted product set; the write itself is wrapped in a React
 *  transition (see useFilterParam.ts) so this never trips loading.tsx. */
export const FILTER_SORT_URL_OPTIONS = {
  history: 'push',
  shallow: false,
  scroll: false,
} as const;

export const loadFilterSort = createLoader(filterSortParsers);
export const serializeFilterSort = createSerializer(filterSortParsers);
