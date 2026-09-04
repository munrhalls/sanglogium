import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { cache } from 'react';
import {
  FILTER_FACETS,
  type FilterFacet,
  isPlaceholderVocab,
} from '@/lib/catalogue/facetMap';
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

export interface CatalogueFacets {
  /** Map of urlParam -> checkbox options (multi / enum / brand). */
  groups: FacetGroups;
  /** Map of urlParam -> count for boolean facets. */
  booleans: BooleanFacetCounts;
  /** Map of brand slug -> label for the brand facet. */
  brandLabels: Record<string, string>;
}

export interface GetFilterFacetsOptions {
  /** The route's VFS key set. */
  keys: string[];
  /** The active filter/sort state (used to compute disjunctive counts). */
  state: ProductQueryState;
}

interface RawProduct {
  _id: string;
  filterAttributes?: Record<string, unknown>;
  brandRef?: { name: string; slug: string } | null;
  price?: number;
  stock?: number;
  reservedStock?: number;
}

function getPriceCents(p: RawProduct): number | null {
  if (p.filterAttributes?.price != null) {
    return Number(p.filterAttributes.price);
  }
  if (p.price != null) return Number(p.price);
  return null;
}

function isInStock(p: RawProduct): boolean {
  if (p.filterAttributes?.inStock != null) {
    return Boolean(p.filterAttributes.inStock);
  }
  const stock = p.stock ?? 0;
  const reserved = p.reservedStock ?? 0;
  return stock - reserved > 0;
}

function valuesForFacet(p: RawProduct, facet: FilterFacet): string[] {
  const field = facet.field.replace('filterAttributes.', '');
  const raw = p.filterAttributes?.[field];
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v).toLowerCase());
  return [String(raw).toLowerCase()];
}

function productMatchesState(
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
    if (facet.urlParam === excludeParam) continue;

    const paramValue = state[facet.urlParam as keyof ProductQueryState];

    if (facet.type === 'boolean') {
      if (paramValue === true) {
        const ok = valuesForFacet(p, facet).some((v) => v === 'true');
        if (!ok) return false;
      }
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
  // Minimal niceties: "4.4mm-balanced" stays as-is, "over-ear" stays as-is.
  return value;
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

const getFilterFacetsFn = async ({
  keys,
  state,
}: GetFilterFacetsOptions): Promise<CatalogueFacets> => {
  if (!keys.length) return { groups: {}, booleans: {}, brandLabels: {} };

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
    return { groups: {}, booleans: {}, brandLabels: {} };
  }

  const groups: FacetGroups = {};
  const booleans: BooleanFacetCounts = {};
  const brandLabels = brandLabelMap(products);

  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price') continue;

    const baseProducts = products.filter((p) => productMatchesState(p, state, facet.urlParam));

    if (facet.type === 'boolean') {
      booleans[facet.urlParam] = baseProducts.filter((p) =>
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
          label: brandLabels[lower] ?? s,
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

  return { groups, booleans, brandLabels };
};

export const getFilterFacets = withCache(getFilterFacetsFn) as (
  options: GetFilterFacetsOptions,
) => Promise<CatalogueFacets>;
