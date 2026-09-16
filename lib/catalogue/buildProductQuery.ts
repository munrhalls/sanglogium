// S1 — the one pure translation from catalogue filter/sort STATE to the GROQ
// fragments the Sanity catalogue fetches need. The catalogue Server Components
// (/products and /products/[...slug]) read the state from `searchParams` via
// `loadFilterSort`, pass it through here, and hand the result to
// `getProductsCount` / `getProductsChunk`.
//
// PURE: no JSX, no data access, no `searchParams` parsing. Its only importer is
// the Server Component — no client module imports it, so there is exactly one
// query translation in the app (risk A2).
//
// SCOPE: all sort options and all filterAttributes facets defined in
// lib/catalogue/facetMap.ts (sourced from _project/filters/facet-map.json and
// sort-map.json). Price, brand, in-stock and all category-specific facets now
// read from the dedicated filterAttributes object, never from free-text fields.

import {
  SORT_DEFAULT,
  SORT_OPTIONS,
  FILTER_SORT_KEYS,
  type SortValue,
} from './filterSortParams';
import { FILTER_FACETS, type FilterFacet, isPlaceholderVocab } from './facetMap';

// Shape matches the server-side loader so RSC and client always agree.
// The loader returns sort/price/inStock plus one key per facet urlParam.
// We expose the fixed fields with their parser types and keep an index for
// the dynamic facet keys so the contract stays type-safe and extensible.
export interface ProductQueryState {
  sort: SortValue;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  [key: string]: unknown;
}

export interface ProductQuery {
  /** GROQ ordering, pipe included: `| order(...)`. Applied before the slice. */
  orderClause: string;
  /** Extra predicate for the `*[...]` filter, `&&`-prefixed. Empty in S1. */
  whereClause: string;
  /** Named params the clauses reference. Merged alongside `keys` by the fetch. */
  params: Record<string, unknown>;
}

const ORDER_BY_SORT: Record<SortValue, string> = Object.fromEntries(
  SORT_OPTIONS.map((o) => {
    switch (o.value) {
      case 'featured':
        return [
          o.value,
          '| order(coalesce(sortAttributes.featuredPriority, displayPriority, 0) desc, coalesce(sortAttributes.popularity, 0) desc, _createdAt desc)',
        ];
      case 'best-selling':
        return [
          o.value,
          '| order(coalesce(sortAttributes.popularity, 0) desc, _createdAt desc)',
        ];
      case 'price-asc':
        return [o.value, '| order(price_data.unit_amount asc, _createdAt desc)'];
      case 'price-desc':
        return [o.value, '| order(price_data.unit_amount desc, _createdAt desc)'];
      case 'newest':
        return [o.value, '| order(_createdAt desc, _id desc)'];
      default:
        return [o.value, '| order(_createdAt desc, _id desc)'];
    }
  })
) as Record<SortValue, string>;

function fieldName(facet: FilterFacet) {
  return facet.field.replace('filterAttributes.', '');
}

function selectedValues(state: ProductQueryState, facet: FilterFacet): string[] {
  const raw = state[facet.urlParam as keyof ProductQueryState];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw) return [raw.trim().toLowerCase()];
  return [];
}

function addMultiOrEnumPredicate(parts: string[], params: Record<string, unknown>, facet: FilterFacet, values: string[]) {
  if (values.length === 0) return;
  const field = facet.field;
  const paramName = `${fieldName(facet)}Param`;

  // sang-logium-3rv.5 -- URL values are lower-cased by selectedValues() and
  // Sanity product data is canonical mixed case (e.g. 'SBC', 'aptX HD',
  // 'V-Shaped', 'IPX4'). Compare with lower() on the product side so the
  // two vocabularies can diverge in case without silently zeroing matches.
  if (facet.type === 'multi' || isPlaceholderVocab(facet.valueVocab)) {
    // Multi-select / array field: any overlap with the selected values.
    parts.push(`count(coalesce(${field}, [])[lower(@) in $${paramName}]) > 0`);
  } else {
    // Enum / string field: each product holds one value, so OR is `in`.
    parts.push(`coalesce(lower(${field}), '') in $${paramName}`);
  }
  params[paramName] = values;
}

export function buildProductQuery(state: ProductQueryState): ProductQuery {
  const sort: SortValue =
    (state.sort as SortValue) ?? SORT_DEFAULT;
  const orderClause = ORDER_BY_SORT[sort] ?? ORDER_BY_SORT[SORT_DEFAULT];

  const parts: string[] = [];
  const params: Record<string, unknown> = {};

  // S2 — price range. The source of truth for price is filterAttributes.price,
  // but the slider and the existing price_data.unit_amount are kept in sync, so
  // we coalesce for a safe fallback until the data migration is complete.
  if (state.minPrice != null) {
    parts.push('coalesce(filterAttributes.price, price_data.unit_amount) >= $minCents');
    params.minCents = state.minPrice * 100;
  }
  if (state.maxPrice != null) {
    parts.push('coalesce(filterAttributes.price, price_data.unit_amount) <= $maxCents');
    params.maxCents = state.maxPrice * 100;
  }

  // In-stock and other boolean facets read from filterAttributes. Availability
  // falls back to the legacy stock arithmetic for products not yet migrated.
  if (state.inStock) {
    parts.push('coalesce(filterAttributes.inStock, stock - reservedStock > 0) == true');
  }

  // Add a predicate for every non-price, non-inStock filter facet.
  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price') continue;
    if (facet.urlParam === 'inStock') continue;

    if (facet.type === 'boolean') {
      const active = state[facet.urlParam as keyof ProductQueryState];
      if (active === true) {
        parts.push(`${facet.field} == true`);
      }
      continue;
    }

    // sang-logium-3rv.5 -- additive: mirrors the minPrice/maxPrice predicates
    // above (S2), generalized to any range-type facet instead of only price.
    // Does not touch the price branch above it.
    if (facet.type === 'range') {
      const minVal = state[`${facet.urlParam}Min` as keyof ProductQueryState];
      const maxVal = state[`${facet.urlParam}Max` as keyof ProductQueryState];
      if (typeof minVal === 'number') {
        const paramName = `${facet.urlParam}MinParam`;
        parts.push(`${facet.field} >= $${paramName}`);
        params[paramName] = minVal;
      }
      if (typeof maxVal === 'number') {
        const paramName = `${facet.urlParam}MaxParam`;
        parts.push(`${facet.field} <= $${paramName}`);
        params[paramName] = maxVal;
      }
      continue;
    }

    const values = selectedValues(state, facet);
    addMultiOrEnumPredicate(parts, params, facet, values);
  }

  const whereClause = parts.length ? ` && ${parts.join(' && ')}` : '';

  return { orderClause, whereClause, params };
}

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
