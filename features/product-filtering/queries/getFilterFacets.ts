// Read use case: facet counts for a route's VFS key set, and the facets the sidebar draws. Takes
// its port as the first parameter; the Sanity fetch lives in adapters/sanity/. One product fetch
// feeds both: the facet list is derived from the same products the counts are computed over.

import {
  computeCatalogueFacets,
  isDefaultFilterState,
  type CatalogueFacets,
} from '@/features/product-filtering/core/rules/facetCounts';
import { buildFacetSet } from '@/features/product-filtering/core/rules/buildFacetSet';
import { dropUnselectableOptions } from '@/features/product-filtering/core/rules/dropUnselectableOptions';
import type { Category } from '@/features/product-filtering/core/definitions/category';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';
import type { FacetSource } from '@/features/product-filtering/core/ports';

export interface GetFilterFacetsOptions {
  /** The route's VFS key set. */
  keys: string[];
  /** The active filter/sort state (used to compute disjunctive counts). */
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

  const { facetSet, dropped } = dropUnselectableOptions(buildFacetSet(products, category ?? 'headphones'));
  if (dropped.length) {
    console.warn('[getFilterFacets] Hidden: the data holds values the URL cannot select. Add them to facetMap.ts valueVocab:', dropped);
  }
  return computeCatalogueFacets(products, state, facetSet);
}
