// Read use case: facet counts for a route's VFS key set. Takes its port as
// the first parameter; the Sanity fetch lives in adapters/sanity/.

import {
  computeCatalogueFacets,
  isDefaultFilterState,
  type CatalogueFacets,
} from '@/features/product-filtering/core/rules/facetCounts';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';
import type { FacetSource } from '@/features/product-filtering/core/ports';

export interface GetFilterFacetsOptions {
  /** The route's VFS key set. */
  keys: string[];
  /** The active filter/sort state (used to compute disjunctive counts). */
  state: ProductQueryState;
}

const emptyFacets = (state: ProductQueryState): CatalogueFacets => ({
  groups: {},
  booleans: {},
  brandLabels: {},
  ranges: {},
  isDefaultState: isDefaultFilterState(state),
});

export async function getFilterFacets(
  fetchProducts: FacetSource,
  { keys, state }: GetFilterFacetsOptions,
): Promise<CatalogueFacets> {
  if (!keys.length) return emptyFacets(state);

  let products;
  try {
    products = await fetchProducts({ keys });
  } catch (error) {
    console.error(`[getFilterFacets] Failed for ${keys.length} keys:`, error);
    return emptyFacets(state);
  }

  return computeCatalogueFacets(products, state);
}
