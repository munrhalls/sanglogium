// Read use case: facet counts for a route's VFS key set, and the facets the sidebar draws. Takes
// its port as the first parameter; the Sanity fetch lives in adapters/sanity/. One product fetch
// feeds both: the facet list is derived from the same products the counts are computed over — and
// the URL state is vetted against that same derivation before any counting happens, so a value the
// data cannot select stays inert everywhere downstream.

import {
  computeCatalogueFacets,
  isDefaultFilterState,
  type CatalogueFacets,
} from '@/features/product-filtering/core/rules/facetCounts';
import { buildFacetSet } from '@/features/product-filtering/core/rules/buildFacetSet';
import { sanitizeFilterState } from '@/features/product-filtering/core/rules/sanitizeFilterState';
import type { Category } from '@/features/product-filtering/core/definitions/category';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';
import type { FacetSource } from '@/features/product-filtering/core/ports';

export interface GetFilterFacetsOptions {
  /** The route's VFS key set. */
  keys: string[];
  /** The filter/sort state as parsed from the URL — vetted here against the facet set before use. */
  state: ProductQueryState;
  /** The route's top-level category. All Products has none and draws the headphones facets, as it always has. */
  category?: Category;
}

const EMPTY_FACET_SET: FacetSet = { groups: [], facets: [], queryOnly: [] };

const emptyFacets = (state: ProductQueryState): CatalogueFacets => ({
  groups: {},
  booleans: {},
  brandLabels: {},
  ranges: {},
  isDefaultState: isDefaultFilterState(state, EMPTY_FACET_SET),
  facetSet: EMPTY_FACET_SET,
  state,
});

export async function getFilterFacets(
  fetchProducts: FacetSource,
  { keys, state, category }: GetFilterFacetsOptions,
): Promise<CatalogueFacets> {
  if (!keys.length) return emptyFacets(state);

  let products;
  try {
    products = await fetchProducts({ keys });
  } catch (error) {
    console.error(`[getFilterFacets] Failed for ${keys.length} keys:`, error);
    return emptyFacets(state);
  }

  const facetSet = buildFacetSet(products, category ?? 'headphones');
  const cleanState = sanitizeFilterState(state, facetSet);
  return computeCatalogueFacets(products, cleanState, facetSet);
}
