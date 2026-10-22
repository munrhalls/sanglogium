import "server-only";

// S1 — the one pure translation from catalogue filter/sort STATE to the GROQ
// fragments the Sanity catalogue fetches need. The catalogue Server Components
// (/products and /products/[...slug]) read the state from `searchParams` via
// `loadFilterSort`, pass it through here, and hand the result to
// `getProductsCount` / `getProductsChunk`.
//
// PURE: no JSX, no data access, no `searchParams` parsing. Its only importer is
// the products slice's Sanity adapter — no client module imports it, so there
// is exactly one query translation in the app (risk A2).
//
// SCOPE: which facets can narrow the query comes from the caller's FacetSet —
// the same derivation that feeds the sidebar and the counts. A URL param that
// is not a facet of this route's set produces no predicate here (inert, not a
// dead end), and a value it cannot select never reaches this function
// (sanitizeFilterState drops it upstream). Each facet's document field is
// `filterAttributes.<attribute>` — the path the selector already carries.

import {
  SORT_DEFAULT,
  SORT_OPTIONS,
  type SortValue,
} from '@/features/product-filtering/core/definitions/sortOptions';
import type { FacetSet, NarrowingFacet, RenderedFacet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';

interface ProductQuery {
  /** GROQ ordering, pipe included: `| order(...)`. Applied before the slice. */
  orderClause: string;
  /** Extra predicate for the `*[...]` filter, `&&`-prefixed. */
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
        return [o.urlValue, '| order(lower(name) desc, _id asc)'];
      default:
        return [o.urlValue, '| order(_createdAt desc, _id desc)'];
    }
  })
) as Record<SortValue, string>;

function fieldPath(facet: NarrowingFacet | RenderedFacet) {
  return `filterAttributes.${facet.attribute}`;
}

function selectedValues(state: ProductQueryState, facetId: string): string[] {
  const raw = state[facetId as keyof ProductQueryState];
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw) return [raw.trim().toLowerCase()];
  return [];
}

function addCheckboxPredicate(parts: string[], params: Record<string, unknown>, facet: NarrowingFacet | RenderedFacet, values: string[]) {
  if (values.length === 0) return;
  const field = fieldPath(facet);
  const paramName = `${facet.id}Param`;

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

const EMPTY_FACET_SET: FacetSet = { groups: [], facets: [], queryOnly: [] };

export function buildProductQuery(state: ProductQueryState, facetSet: FacetSet = EMPTY_FACET_SET): ProductQuery {
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

  // A predicate for every selected narrowing facet of this route's set.
  for (const facet of [...facetSet.facets, ...facetSet.queryOnly]) {
    if (facet.id === 'inStock') continue; // handled above — it keeps its stock-arithmetic fallback.

    if (facet.control === 'boolean') {
      if (state[facet.id as keyof ProductQueryState] === true) {
        parts.push(`${fieldPath(facet)} == true`);
      }
      continue;
    }

    // Mirrors productMatchesState's in-memory range check (sang-logium-3rv.5):
    // `${facet.id}Min`/`${facet.id}Max`, same shape as minPrice/maxPrice.
    if (facet.control === 'range') {
      const minVal = state[`${facet.id}Min` as keyof ProductQueryState];
      const maxVal = state[`${facet.id}Max` as keyof ProductQueryState];
      if (typeof minVal === 'number') {
        const paramName = `${facet.id}MinParam`;
        parts.push(`${fieldPath(facet)} >= $${paramName}`);
        params[paramName] = minVal;
      }
      if (typeof maxVal === 'number') {
        const paramName = `${facet.id}MaxParam`;
        parts.push(`${fieldPath(facet)} <= $${paramName}`);
        params[paramName] = maxVal;
      }
      continue;
    }

    addCheckboxPredicate(parts, params, facet, selectedValues(state, facet.id));
  }

  const whereClause = parts.length ? ` && ${parts.join(' && ')}` : '';

  return { orderClause, whereClause, params };
}
