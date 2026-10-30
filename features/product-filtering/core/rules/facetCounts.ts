// Pure facet-count logic: in-memory matching engine and aggregation over an
// already-fetched product set. No Sanity, no fetch, no cache — those live in
// queries/getFilterFacets.ts, which calls this module. Which facets exist and
// how each one behaves (checkbox, boolean, range) comes from the FacetSet the
// caller passes in (core/rules/buildFacetSet.ts), not from a declared list.

import { humanizeFacetValue } from './humanizeFacetValue';
import type { PriceRangeData } from './priceBounds';
import type { FacetSet, NarrowingFacet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState, RawProduct } from '@/features/product-filtering/core/types/filterTypes';

interface FacetOption {
  value: string;
  label: string;
  count: number;
}

type FacetGroups = Record<string, FacetOption[]>;
type BooleanFacetCounts = Record<string, number>;

/** Full category span (unnarrowed by active filters) for a range facet, in
 *  its raw field unit -- mirrors the price treatment in priceBounds.ts. */
export interface RangeBounds {
  min: number | null;
  max: number | null;
}

export interface CatalogueFacets {
  /** Map of facet id -> checkbox options (multi / enum / brand). */
  groups: FacetGroups;
  /** Map of facet id -> count for boolean facets. */
  booleans: BooleanFacetCounts;
  /** Map of brand slug -> label for the brand facet. */
  brandLabels: Record<string, string>;
  /** Map of facet id -> real min/max for range facets (sang-logium-3rv.5). */
  ranges: Record<string, RangeBounds>;
  /** Full price span (cents) of the fetched products, unnarrowed by active filters; feeds resolvePriceBounds. */
  priceRange: PriceRangeData;
  /** Whether no catalogue filters are currently active (sort is ignored). */
  isDefaultState: boolean;
  /** The facets to draw: the set these counts were computed for. */
  facetSet: FacetSet;
  /** The state these counts were computed over, after vetting against the facet set. */
  state: ProductQueryState;
}

function getPriceCents(p: RawProduct): number | null {
  return p.price != null ? Number(p.price) : null;
}

function isInStock(p: RawProduct): boolean {
  const stock = p.stock ?? 0;
  const reserved = p.reservedStock ?? 0;
  return stock - reserved > 0;
}

function valuesForFacet(p: RawProduct, facet: { attribute: string }): string[] {
  const raw = p.filterAttributes?.[facet.attribute];
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v).toLowerCase());
  return [String(raw).toLowerCase()];
}

/**
 * Numeric value for a range facet, following its (possibly nested)
 * `attribute` path -- e.g. 'freqResponseHz.min' or 'batteryLifeHours.ancOff'
 * -- unlike `valuesForFacet` above, which only reads a top-level
 * filterAttributes key.
 */
function numericValueForRangeFacet(p: RawProduct, facet: { attribute: string }): number | null {
  const path = facet.attribute.split('.');
  let cur: unknown = p.filterAttributes;
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[key];
  }
  if (cur == null) return null;
  const num = Number(cur);
  return Number.isFinite(num) ? num : null;
}

/** Every facet that narrows a count: the ones drawn plus the query-only ones. */
function narrowingFacets(facetSet: FacetSet): NarrowingFacet[] {
  return [...facetSet.facets, ...facetSet.queryOnly];
}

export function productMatchesState(
  p: RawProduct,
  state: ProductQueryState,
  facetSet: FacetSet,
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

  for (const facet of narrowingFacets(facetSet)) {
    if (facet.id === 'inStock') continue;
    if (facet.id === excludeParam) continue;

    const paramValue = state[facet.id as keyof ProductQueryState];

    if (facet.control === 'boolean') {
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
    if (facet.control === 'range') {
      const minVal = state[`${facet.id}Min` as keyof ProductQueryState];
      const maxVal = state[`${facet.id}Max` as keyof ProductQueryState];
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

function labelForValue(facetId: string, value: string): string {
  if (facetId === 'brand' && !value) return 'Unknown';
  return humanizeFacetValue(value);
}

function brandLabelMap(products: RawProduct[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const p of products) {
    for (const slug of valuesForFacet(p, { attribute: 'brand' })) {
      if (!map[slug]) {
        map[slug] = p.brandRef?.slug?.toLowerCase() === slug ? p.brandRef.name : slug;
      }
    }
  }
  return map;
}

export function isDefaultFilterState(state: ProductQueryState, facetSet: FacetSet): boolean {
  if (state.minPrice != null || state.maxPrice != null) return false;

  for (const facet of narrowingFacets(facetSet)) {
    if (facet.control === 'range') {
      if (state[`${facet.id}Min` as keyof ProductQueryState] != null) return false;
      if (state[`${facet.id}Max` as keyof ProductQueryState] != null) return false;
      continue;
    }

    if (facet.control === 'boolean') {
      if (state[facet.id as keyof ProductQueryState] === true) return false;
      continue;
    }

    const value = state[facet.id as keyof ProductQueryState];
    if (Array.isArray(value) && value.length > 0) return false;
    if (typeof value === 'string' && value) return false;
  }

  return true;
}

/** Pure facet counts over an already-fetched product set (catalogue routes and /search share it). */
export function computeCatalogueFacets(
  products: RawProduct[],
  state: ProductQueryState,
  facetSet: FacetSet,
): CatalogueFacets {
  const groups: FacetGroups = {};
  const booleans: BooleanFacetCounts = {};
  const brandLabels = brandLabelMap(products);

  for (const facet of facetSet.facets) {
    // Range facets get their own bounds computation below, not checkbox options.
    if (facet.control === 'range') continue;

    const baseProducts = products.filter((p) => productMatchesState(p, state, facetSet, facet.id));

    if (facet.control === 'boolean') {
      // In stock is special: it counts by the stock fields, the same as buildProductQuery.
      booleans[facet.id] = baseProducts.filter(
        facet.id === 'inStock' ? isInStock : (p) =>
          valuesForFacet(p, facet).some((v) => v === 'true'),
      ).length;
      continue;
    }

    // The option values are the data's distinct values, carried by the facet. A facet
    // without them (brand) takes the values present among the products the other
    // selections leave.
    const listed = new Map<string, string>((facet.options ?? []).map((o): [string, string] => [o.value.toLowerCase(), o.label]));
    let optionValues: string[];
    if (facet.options) {
      optionValues = facet.options.map((o) => o.value);
    } else {
      const set = new Set<string>();
      for (const p of baseProducts) {
        for (const v of valuesForFacet(p, facet)) if (v) set.add(v);
      }
      optionValues = Array.from(set).sort();
    }

    const labelOf = (value: string): string => {
      const lower = value.toLowerCase();
      if (facet.id === 'brand' && brandLabels[lower]) return brandLabels[lower];
      return listed.get(lower) ?? labelForValue(facet.id, value);
    };

    // Keep currently selected values visible even if their count is zero, so the
    // shopper can untick them and see the label.
    const selected = Array.isArray(state[facet.id as keyof ProductQueryState])
      ? (state[facet.id as keyof ProductQueryState] as string[])
      : [];

    const options: FacetOption[] = optionValues.map((value) => {
      const valueLower = value.toLowerCase();
      const count = baseProducts.filter((p) =>
        valuesForFacet(p, facet).some((v) => v === valueLower),
      ).length;
      return { value, label: labelOf(value), count };
    });

    // Append any selected value that is not in the option set.
    for (const s of selected) {
      const lower = s.toLowerCase();
      if (!optionValues.some((v) => v.toLowerCase() === lower)) {
        options.push({
          value: s,
          label: labelOf(s),
          count: baseProducts.filter((p) =>
            valuesForFacet(p, facet).some((v) => v === lower),
          ).length,
        });
      }
    }

    options.sort((a, b) =>
      b.count - a.count || a.label.localeCompare(b.label)
    );

    groups[facet.id] = options;
  }

  // Range facet bounds: FULL category span, unnarrowed by active filters --
  // same "max handle can always drag back up" reasoning as
  // the price slider, from the one product fetch already above.
  // sang-logium-3rv.5.
  const ranges: Record<string, RangeBounds> = {};
  for (const facet of facetSet.facets) {
    if (facet.control !== 'range') continue;
    const values = products
      .map((p) => numericValueForRangeFacet(p, facet))
      .filter((v): v is number => v != null);
    ranges[facet.id] = {
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
    };
  }

  const prices = products.map((p) => p.price).filter((n): n is number => typeof n === 'number');
  const priceRange: PriceRangeData = {
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    prices,
  };

  return {
    groups,
    booleans,
    brandLabels,
    ranges,
    priceRange,
    isDefaultState: isDefaultFilterState(state, facetSet),
    facetSet,
    state,
  };
}
