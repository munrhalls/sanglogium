import "server-only";

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
// ../../core/definitions/facetMap.ts. Price, brand, in-stock and all category-specific facets now
// read from the dedicated filterAttributes object, never from free-text fields.

import {
  FILTER_FACETS,
  SORT_DEFAULT,
  SORT_OPTIONS,
  type FilterFacet,
  type SortValue,
} from '@/features/product-filtering/core/definitions/facetMap';
import { FACET_FIELD_MAP } from './fieldMap';
import type { ProductQueryState } from '@/features/product-filtering/core/rules/filterTypes';

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
    switch (o.urlValue) {
      case 'featured':
        return [
          o.urlValue,
          '| order(coalesce(sortAttributes.featuredPriority, displayPriority, 0) desc, coalesce(sortAttributes.popularity, 0) desc, _createdAt desc)',
        ];
      case 'best-selling':
        return [
          o.urlValue,
          '| order(coalesce(sortAttributes.popularity, 0) desc, _createdAt desc)',
        ];
      case 'price-asc':
        return [o.urlValue, '| order(price_data.unit_amount asc, _createdAt desc)'];
      case 'price-desc':
        return [o.urlValue, '| order(price_data.unit_amount desc, _createdAt desc)'];
      case 'newest':
        return [o.urlValue, '| order(_createdAt desc, _id desc)'];
      case 'alpha-asc':
        return [o.urlValue, '| order(lower(name) asc, _id asc)'];
      case 'alpha-desc':
        return [o.urlValue, '| order(lower(name) desc, _id desc)'];
      case 'date-old':
        return [o.urlValue, '| order(_createdAt asc, _id asc)'];
      default:
        return [o.urlValue, '| order(_createdAt desc, _id desc)'];
    }
  })
) as Record<SortValue, string>;

function fieldName(facet: FilterFacet) {
  return facet.attribute;
}

function fieldPath(facet: FilterFacet) {
  return FACET_FIELD_MAP[facet.urlParam];
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
  const field = fieldPath(facet);
  const paramName = `${fieldName(facet)}Param`;

  // sang-logium-3rv.5 -- URL values are lower-cased by selectedValues() and
  // Sanity product data is canonical mixed case (e.g. 'SBC', 'aptX HD',
  // 'V-Shaped', 'IPX4'). Compare with lower() on the product side so the
  // two vocabularies can diverge in case without silently zeroing matches.
  //
  // sang-logium-269 -- a field's real per-document storage shape does not
  // always match its schema-declared type: a 'multi' (array) field is
  // sometimes stored as a bare scalar on an individual product, and an
  // 'enum' (scalar) field is sometimes stored as a one-element array
  // (confirmed live on accessories: compatibleProductType, conductorMaterial,
  // material, balancedUnbalanced, brand all had real products silently
  // excluded by a type-driven predicate). GROQ degrades both shape
  // mismatches to null rather than erroring -- lower() on an array, and
  // indexing [...] on a scalar/null, both return null -- so checking BOTH
  // shapes with OR is exactly as correct as the old single-shape predicate
  // for genuinely single-shape data (the other branch is just always false)
  // and additionally correct for the mixed-shape data observed live.
  parts.push(
    `(coalesce(lower(${field}), '') in $${paramName} || count(coalesce(${field}, [])[lower(@) in $${paramName}]) > 0)`,
  );
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
        parts.push(`${fieldPath(facet)} == true`);
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
        parts.push(`${fieldPath(facet)} >= $${paramName}`);
        params[paramName] = minVal;
      }
      if (typeof maxVal === 'number') {
        const paramName = `${facet.urlParam}MaxParam`;
        parts.push(`${fieldPath(facet)} <= $${paramName}`);
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
