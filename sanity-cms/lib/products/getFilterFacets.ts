import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { cache } from 'react';
import {
  FILTER_FACETS,
  type FilterFacet,
  isPlaceholderVocab,
} from '@/lib/catalogue/facetMap';
import { humanizeFacetValue } from '@/lib/catalogue/humanizeFacetValue';
import type { ProductQueryState } from '@/lib/catalogue/buildProductQuery';

const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export type FacetGroups = Record<string, FacetOption[]>;
export type BooleanFacetCounts = Record<string, number>;

/** Full category span (unnarrowed by active filters) for a range facet, in
 *  its raw field unit -- mirrors getCategoryPriceRange's price treatment. */
export interface RangeBounds {
  min: number | null;
  max: number | null;
}

export interface CatalogueFacets {
  /** Map of urlParam -> checkbox options (multi / enum / brand). */
  groups: FacetGroups;
  /** Map of urlParam -> count for boolean facets. */
  booleans: BooleanFacetCounts;
  /** Map of brand slug -> label for the brand facet. */
  brandLabels: Record<string, string>;
  /** Map of urlParam -> real min/max for range facets (sang-logium-3rv.5). */
  ranges: Record<string, RangeBounds>;
  /** Whether no catalogue filters are currently active (sort is ignored). */
  isDefaultState: boolean;
}

export interface GetFilterFacetsOptions {
  /** The route's VFS key set. */
  keys: string[];
  /** The active filter/sort state (used to compute disjunctive counts). */
  state: ProductQueryState;
}

// Exported (sang-logium-3rv.12): previously module-private. Made directly
// testable so the in-memory matching engine has its own correctness coverage
// -- see sanity-cms/lib/products/__tests__/getFilterFacets.spec.ts. Purely
// additive visibility change, no behaviour change.
export interface RawProduct {
  _id: string;
  filterAttributes?: Record<string, unknown>;
  brandRef?: { name: string; slug: string } | null;
  price?: number;
  stock?: number;
  reservedStock?: number;
}

export function getPriceCents(p: RawProduct): number | null {
  if (p.filterAttributes?.price != null) {
    return Number(p.filterAttributes.price);
  }
  if (p.price != null) return Number(p.price);
  return null;
}

export function isInStock(p: RawProduct): boolean {
  if (p.filterAttributes?.inStock != null) {
    return Boolean(p.filterAttributes.inStock);
  }
  const stock = p.stock ?? 0;
  const reserved = p.reservedStock ?? 0;
  return stock - reserved > 0;
}

export function valuesForFacet(p: RawProduct, facet: FilterFacet): string[] {
  const field = facet.field.replace('filterAttributes.', '');
  const raw = p.filterAttributes?.[field];
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v).toLowerCase());
  return [String(raw).toLowerCase()];
}

/**
 * Numeric value for a range facet, following its (possibly nested) `field`
 * path -- e.g. 'freqResponseHz.min' or 'batteryLifeHours.ancOff' -- unlike
 * `valuesForFacet` above, which only reads a top-level filterAttributes key.
 */
export function numericValueForRangeFacet(p: RawProduct, facet: FilterFacet): number | null {
  const path = facet.field.replace('filterAttributes.', '').split('.');
  let cur: unknown = p.filterAttributes;
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[key];
  }
  if (cur == null) return null;
  const num = Number(cur);
  return Number.isFinite(num) ? num : null;
}

export function productMatchesState(
  p: RawProduct,
  state: ProductQueryState,
  excludeParam?: string,
): boolean {
  // Price range
  const priceCents = getPriceCents(p);
  if (excludeParam !== 'minPrice' && state.minPrice != null) {
    if (priceCents == null || priceCents < state.minPrice * 100) return false;
  }
  if (excludeParam !== 'maxPrice' && state.maxPrice != null) {
    if (priceCents == null || priceCents > state.maxPrice * 100) return false;
  }

  // In stock
  if (excludeParam !== 'inStock' && state.inStock && !isInStock(p)) return false;

  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price') continue;
    if (facet.urlParam === 'inStock') continue;
    if (facet.urlParam === excludeParam) continue;

    const paramValue = state[facet.urlParam as keyof ProductQueryState];

    if (facet.type === 'boolean') {
      if (paramValue === true) {
        const ok = valuesForFacet(p, facet).some((v) => v === 'true');
        if (!ok) return false;
      }
      continue;
    }

    // sang-logium-3rv.5 -- additive: an active range-facet selection must
    // narrow every OTHER facet's disjunctive count too, same as price/inStock
    // already do above. Mirrors buildProductQuery.ts's GROQ range predicate,
    // in-memory.
    if (facet.type === 'range') {
      const minVal = state[`${facet.urlParam}Min` as keyof ProductQueryState];
      const maxVal = state[`${facet.urlParam}Max` as keyof ProductQueryState];
      if (typeof minVal !== 'number' && typeof maxVal !== 'number') continue;
      const num = numericValueForRangeFacet(p, facet);
      if (typeof minVal === 'number' && (num == null || num < minVal)) return false;
      if (typeof maxVal === 'number' && (num == null || num > maxVal)) return false;
      continue;
    }

    const selected = Array.isArray(paramValue)
      ? paramValue.map((s) => String(s).toLowerCase()).filter(Boolean)
      : typeof paramValue === 'string' && paramValue
        ? [paramValue.toLowerCase()]
        : [];

    if (selected.length === 0) continue;

    const productValues = valuesForFacet(p, facet);
    const overlap = productValues.some((v) => selected.includes(v));
    if (!overlap) return false;
  }

  return true;
}

function labelForValue(facet: FilterFacet, value: string): string {
  if (facet.urlParam === 'brand' && !value) return 'Unknown';
  return humanizeFacetValue(value);
}

function distinctBrandSlugs(products: RawProduct[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    const slugs = valuesForFacet(p, FILTER_FACETS.find((f) => f.urlParam === 'brand')!);
    for (const s of slugs) if (s) set.add(s);
  }
  return Array.from(set);
}

function brandLabelMap(products: RawProduct[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of products) {
    for (const slug of valuesForFacet(p, FILTER_FACETS.find((f) => f.urlParam === 'brand')!)) {
      if (!map[slug]) {
        map[slug] = p.brandRef?.slug?.toLowerCase() === slug ? p.brandRef.name : slug;
      }
    }
  }
  return map;
}

function isDefaultFilterState(state: ProductQueryState): boolean {
  if (state.minPrice != null || state.maxPrice != null) return false;

  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price') continue;

    if (facet.type === 'range') {
      if (state[`${facet.urlParam}Min` as keyof ProductQueryState] != null) return false;
      if (state[`${facet.urlParam}Max` as keyof ProductQueryState] != null) return false;
      continue;
    }

    if (facet.type === 'boolean') {
      if (state[facet.urlParam as keyof ProductQueryState] === true) return false;
      continue;
    }

    const value = state[facet.urlParam as keyof ProductQueryState];
    if (Array.isArray(value) && value.length > 0) return false;
    if (typeof value === 'string' && value) return false;
  }

  return true;
}

const getFilterFacetsFn = async ({
  keys,
  state,
}: GetFilterFacetsOptions): Promise<CatalogueFacets> => {
  if (!keys.length) return { groups: {}, booleans: {}, brandLabels: {}, ranges: {}, isDefaultState: isDefaultFilterState(state) };

  const query = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] {
    _id,
    filterAttributes,
    "brandRef": brand->{ name, "slug": slug.current },
    "price": price_data.unit_amount,
    stock,
    reservedStock
  }`;

  let products: RawProduct[] = [];
  try {
    products = (await sanityFetch<RawProduct[]>({ query, params: { keys } })) ?? [];
  } catch (error) {
    console.error(`[getFilterFacets] Failed for ${keys.length} keys:`, error);
    return { groups: {}, booleans: {}, brandLabels: {}, ranges: {} };
  }

  const groups: FacetGroups = {};
  const booleans: BooleanFacetCounts = {};
  const brandLabels = brandLabelMap(products);

  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price') continue;
    // Range facets get their own bounds computation below, not checkbox
    // options built from their ['min','max'] valueVocab placeholder.
    if (facet.type === 'range') continue;

    const baseProducts = products.filter((p) => productMatchesState(p, state, facet.urlParam));

    if (facet.type === 'boolean') {
      // In-stock is special: it must mirror buildProductQuery's coalesce of
      // filterAttributes.inStock and the legacy stock arithmetic. Counting only
      // products with an explicit `filterAttributes.inStock == true` would show
      // zero until every product is migrated (sang-logium-3rv.7).
      booleans[facet.urlParam] = baseProducts.filter(
        facet.urlParam === 'inStock' ? isInStock : (p) =>
          valuesForFacet(p, facet).some((v) => v === 'true'),
      ).length;
      continue;
    }

    let optionValues: string[];
    if (isPlaceholderVocab(facet.valueVocab)) {
      // For placeholder-backed fields (brand / compatibility) collect the actual
      // distinct values present in the data.
      const set = new Set<string>();
      for (const p of baseProducts) {
        for (const v of valuesForFacet(p, facet)) if (v) set.add(v);
      }
      optionValues = Array.from(set).sort();
    } else {
      optionValues = facet.valueVocab;
    }

    // Keep currently selected values visible even if their count is zero, so the
    // shopper can untick them and see the label.
    const selected = Array.isArray(state[facet.urlParam as keyof ProductQueryState])
      ? (state[facet.urlParam as keyof ProductQueryState] as string[])
      : [];
    const selectedSet = new Set(selected.map((s) => s.toLowerCase()));

    const options: FacetOption[] = optionValues.map((value) => {
      const valueLower = value.toLowerCase();
      const count = baseProducts.filter((p) =>
        valuesForFacet(p, facet).some((v) => v === valueLower),
      ).length;
      return {
        value,
        label: brandLabels[valueLower] ?? labelForValue(facet, value),
        count,
      };
    });

    // Append any selected slugs that are not in the closed vocab/placeholder set.
    for (const s of selected) {
      const lower = s.toLowerCase();
      if (!optionValues.some((v) => v.toLowerCase() === lower)) {
        options.push({
          value: s,
          label: brandLabels[lower] ?? humanizeFacetValue(s),
          count: baseProducts.filter((p) =>
            valuesForFacet(p, facet).some((v) => v === lower),
          ).length,
        });
      }
    }

    options.sort((a, b) =>
      b.count - a.count || a.label.localeCompare(b.label)
    );

    groups[facet.urlParam] = options;
  }

  // Range facet bounds: FULL category span, unnarrowed by active filters --
  // same "max handle can always drag back up" reasoning as
  // getCategoryPriceRange, reusing the one product fetch already above
  // instead of a second query. sang-logium-3rv.5.
  const ranges: Record<string, RangeBounds> = {};
  for (const facet of FILTER_FACETS) {
    if (facet.type !== 'range' || facet.urlParam === 'price') continue;
    const values = products
      .map((p) => numericValueForRangeFacet(p, facet))
      .filter((v): v is number => v != null);
    ranges[facet.urlParam] = {
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
    };
  }

  return { groups, booleans, brandLabels, ranges, isDefaultState: isDefaultFilterState(state) };
};

export const getFilterFacets = withCache(getFilterFacetsFn) as (
  options: GetFilterFacetsOptions,
) => Promise<CatalogueFacets>;
