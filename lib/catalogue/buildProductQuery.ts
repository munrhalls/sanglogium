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
// SCOPE: the SORT branch (S1) + the PRICE / IN-STOCK where-predicates (S2).
//   • S3 fills the brand predicate.
// S3 appends to `parts` / `params` below at its marked TODO. Adding a brand
// predicate here is out of scope — stop and flag (risk A1/A4).

import { SORT_DEFAULT, type SortValue } from './filterSortParams';

export interface ProductQueryState {
  sort: SortValue;
  // S2: price range in whole DOLLARS (the F1 URL contract) + in-stock flag.
  minPrice?: number | null;
  maxPrice?: number | null;
  inStock?: boolean;
  // S3: comma-separated brand slugs from the F1 URL contract. Empty = no filter.
  brand?: string[];
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

  // S2 — price range + in-stock. Dollars → cents (x100) at this edge only;
  // bounds are inclusive; a missing bound omits that side. `minPrice` /
  // `maxPrice` come straight from the F1 URL contract (null when absent/junk).
  if (state.minPrice != null) {
    parts.push('price_data.unit_amount >= $minCents');
    params.minCents = state.minPrice * 100;
  }
  if (state.maxPrice != null) {
    parts.push('price_data.unit_amount <= $maxCents');
    params.maxCents = state.maxPrice * 100;
  }
  if (state.inStock) {
    parts.push('stock - reservedStock > 0');
  }

  // S3 — brand facet. `brand` is a reference on productType.ts, so it must be
  // dereferenced with `->` (mirrors PRODUCT_PROJECTION's `brand->{ ... slug }`).
  // Slugs are lowercased on both sides so a URL "Sennheiser" matches a stored
  // "sennheiser". An empty set omits the clause entirely (no filter, not `in []`);
  // unknown slugs simply match nothing.
  const brandSlugs = (state.brand ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (brandSlugs.length) {
    parts.push('lower(brand->slug.current) in $brands');
    params.brands = brandSlugs;
  }

  const whereClause = parts.length ? ` && ${parts.join(' && ')}` : '';

  return { orderClause, whereClause, params };
}
