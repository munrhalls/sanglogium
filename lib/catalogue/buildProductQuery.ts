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
// SCOPE (S1): the SORT branch only. `whereClause` is always empty here.
//   • S2 fills the price + in-stock predicates.
//   • S3 fills the brand predicate.
// Each sibling appends to `parts` / `params` below at its marked TODO. Adding a
// predicate in this slice is out of scope — stop and flag (risk A1).

import { SORT_DEFAULT, type SortValue } from './filterSortParams';

export interface ProductQueryState {
  sort: SortValue;
  // S2: minPrice?: number | null;  maxPrice?: number | null;  inStock?: boolean;
  // S3: brand?: string[];
}

export interface ProductQuery {
  /** GROQ ordering, pipe included: `| order(...)`. Applied before the slice. */
  orderClause: string;
  /** Extra predicate for the `*[...]` filter, `&&`-prefixed. Empty in S1. */
  whereClause: string;
  /** Named params the clauses reference. Merged alongside `keys` by the fetch. */
  params: Record<string, unknown>;
}

// Sort mapping — fields verified against sanity-cms/schemaTypes/productType.ts:
// `displayPriority` (number, optional — "treated as 0" when unset, ties break by
// newest), `price_data.unit_amount` (number, cents), `_createdAt` (system).
const ORDER_BY_SORT: Record<SortValue, string> = {
  featured: '| order(coalesce(displayPriority, 0) desc, _createdAt desc)',
  'price-asc': '| order(price_data.unit_amount asc)',
  'price-desc': '| order(price_data.unit_amount desc)',
  newest: '| order(_createdAt desc)',
};

export function buildProductQuery(state: ProductQueryState): ProductQuery {
  const orderClause = ORDER_BY_SORT[state.sort] ?? ORDER_BY_SORT[SORT_DEFAULT];

  const parts: string[] = [];
  const params: Record<string, unknown> = {};

  // S2: push price / in-stock predicates here, add their params.
  // S3: push the brand predicate here, add its param.

  const whereClause = parts.length ? ` && ${parts.join(' && ')}` : '';

  return { orderClause, whereClause, params };
}
