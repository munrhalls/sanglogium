// POC-local mirror of lib/catalogue/buildProductQuery.ts + getFilterFacets.ts,
// re-targeted at an in-memory array instead of a GROQ query — the Sanity
// catalogue is the production data source, this dataset is a local JSON
// snapshot (see scripts/poc-fetch-accessories-dataset.mjs), so filtering here
// is a pure in-memory predicate instead of a where-clause string.
//
// PURE: no JSX. This is the Products Grid actor's only knowledge of "how to
// read the URL state into a product set" — it never writes the URL, and the
// Sidebar/SortBar/Chips actors never import this module (Slice separation).

import { FACETS, SORT_DEFAULT, type FacetDef, type SortValue } from './facetConfig';
import type { FilterSortState } from './filterSortParams';
import type { AccessoryProduct } from './types';

// ── Reading a facet's value off a product / off the URL state ──────────────

function productValues(product: AccessoryProduct, facet: FacetDef): string[] {
  // Brand is the one facet whose field (`brand`) is a dereferenced object
  // ({_id, name, slug}), not a flat value — the filterable value is its slug.
  if (facet.id === 'brand') {
    const slug = product.brand?.slug?.current;
    return slug ? [slug.toLowerCase()] : [];
  }
  const raw = (product as unknown as Record<string, unknown>)[facet.field as string];
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v).toLowerCase());
  return [String(raw).toLowerCase()];
}

function selectedValues(state: FilterSortState, facet: FacetDef): string[] {
  const raw = state[facet.id];
  if (Array.isArray(raw)) return raw.map((v) => String(v).toLowerCase()).filter(Boolean);
  return [];
}

// ── Predicate (S1-equivalent) ───────────────────────────────────────────────

/**
 * Whether `product` matches `state`. `excludeParam`, when given, skips that one
 * param's own predicate — used to compute disjunctive per-option counts (a
 * facet's own selection never narrows its own option list, only every other
 * active filter does), exactly mirroring production's getFilterFacets.ts.
 */
export function productMatchesState(
  product: AccessoryProduct,
  state: FilterSortState,
  excludeParam?: string,
): boolean {
  if (excludeParam !== 'minPrice' && state.minPrice != null) {
    if (product.price_data.unit_amount < state.minPrice * 100) return false;
  }
  if (excludeParam !== 'maxPrice' && state.maxPrice != null) {
    if (product.price_data.unit_amount > state.maxPrice * 100) return false;
  }
  if (excludeParam !== 'minRating' && state.minRating != null) {
    if (product.rating < state.minRating) return false;
  }

  for (const facet of FACETS) {
    if (facet.id === excludeParam) continue;

    if (facet.control === 'boolean') {
      if (state[facet.id] === true) {
        const value = (product as unknown as Record<string, unknown>)[facet.field as string];
        if (value !== true) return false;
      }
      continue;
    }

    if (facet.control === 'range') {
      const min = state[`${facet.id}Min`] as number | null | undefined;
      const max = state[`${facet.id}Max`] as number | null | undefined;
      if (min == null && max == null) continue;
      const value = (product as unknown as Record<string, unknown>)[facet.field as string];
      if (typeof value !== 'number') return false; // range active, product has no value for it (e.g. battery life on a wired can)
      if (min != null && value < min) return false;
      if (max != null && value > max) return false;
      continue;
    }

    // checkbox
    const selected = selectedValues(state, facet);
    if (selected.length === 0) continue;
    const values = productValues(product, facet);
    if (!values.some((v) => selected.includes(v))) return false;
  }

  return true;
}

export function filterProducts(products: AccessoryProduct[], state: FilterSortState): AccessoryProduct[] {
  return products.filter((p) => productMatchesState(p, state));
}

// ── Sort (F-sort equivalent) ─────────────────────────────────────────────

const byString = (a: string, b: string) => a.localeCompare(b);
const byNumber = (a: number, b: number) => a - b;

/** Bayesian-weighted rating: pulls low-review-count items toward the dataset
 *  mean so a single 5★ review can't outrank hundreds of 4.7★ ones —
 *  should-be.md's explicit "weight by count, not average alone" caution. */
function weightedRating(p: AccessoryProduct, meanRating: number, minVotes = 15): number {
  const v = p.ratingCount;
  return (v / (v + minVotes)) * p.rating + (minVotes / (v + minVotes)) * meanRating;
}

export function sortProducts(products: AccessoryProduct[], sort: SortValue): AccessoryProduct[] {
  const meanRating = products.length ? products.reduce((sum, p) => sum + p.rating, 0) / products.length : 0;
  const sorted = [...products];

  switch (sort) {
    case 'most-relevant':
      // No search query exists on a pure category browse, so there is nothing
      // to rank textual relevance against — falls back to Featured rather
      // than faking a relevance score (AI_LESSONS L11).
      return sorted.sort((a, b) => b.featuredPriority - a.featuredPriority || b.popularity - a.popularity);
    case 'best-selling':
      return sorted.sort((a, b) => b.popularity - a.popularity);
    case 'alpha-asc':
      return sorted.sort((a, b) => byString(a.name, b.name));
    case 'alpha-desc':
      return sorted.sort((a, b) => byString(b.name, a.name));
    case 'price-asc':
      return sorted.sort((a, b) => byNumber(a.price_data.unit_amount, b.price_data.unit_amount));
    case 'price-desc':
      return sorted.sort((a, b) => byNumber(b.price_data.unit_amount, a.price_data.unit_amount));
    case 'date-old':
      return sorted.sort((a, b) => byString(a._createdAt, b._createdAt));
    case 'date-new':
      return sorted.sort((a, b) => byString(b._createdAt, a._createdAt));
    case 'rating-desc':
      return sorted.sort((a, b) => weightedRating(b, meanRating) - weightedRating(a, meanRating));
    case 'discount-desc':
      return sorted.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    case 'featured':
    default:
      return sorted.sort((a, b) => b.featuredPriority - a.featuredPriority || b.popularity - a.popularity);
  }
}

// ── Facet option counts (F5-equivalent, disjunctive) ────────────────────────

export interface FacetOptionCount {
  value: string;
  count: number;
}

/** Per-facet option counts computed against `state` with that facet's own
 *  selection excluded — lets a shopper see what ticking another option in the
 *  SAME group would add, without the group narrowing itself away. */
export function computeFacetCounts(
  products: AccessoryProduct[],
  state: FilterSortState,
): Record<string, FacetOptionCount[]> {
  const result: Record<string, FacetOptionCount[]> = {};

  for (const facet of FACETS) {
    if (facet.control !== 'checkbox') continue;
    const base = products.filter((p) => productMatchesState(p, state, facet.id));

    const optionValues =
      facet.options === 'derived'
        ? Array.from(new Set(base.flatMap((p) => productValues(p, facet)))).sort()
        : facet.options.map((o) => o.value);

    result[facet.id] = optionValues.map((value) => ({
      value,
      count: base.filter((p) => productValues(p, facet).includes(value)).length,
    }));
  }

  return result;
}

export function computeBooleanCounts(products: AccessoryProduct[], state: FilterSortState): Record<string, number> {
  const result: Record<string, number> = {};
  for (const facet of FACETS) {
    if (facet.control !== 'boolean') continue;
    const base = products.filter((p) => productMatchesState(p, state, facet.id));
    result[facet.id] = base.filter(
      (p) => (p as unknown as Record<string, unknown>)[facet.field as string] === true,
    ).length;
  }
  return result;
}

export function derivedBrandLabels(products: AccessoryProduct[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of products) {
    const slug = p.brand?.slug?.current?.toLowerCase();
    if (slug && !map[slug]) map[slug] = p.brand!.name;
  }
  return map;
}

export const DEFAULT_SORT: SortValue = SORT_DEFAULT;
