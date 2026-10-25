// Read use case: facet counts for a route's VFS key set, and the facets the sidebar draws. Takes
// its ports as the first parameter; the Sanity fetches live in adapters/sanity/. One product fetch
// feeds both: the facet list is derived from the same products the counts are computed over — and
// the raw URL query is decoded against that same facet set before any counting happens, so a value
// the data cannot select stays inert everywhere downstream.

import {
  computeCatalogueFacets,
  isDefaultFilterState,
  type CatalogueFacets,
} from '@/features/product-filtering/core/rules/facetCounts';
import { buildFacetSet } from '@/features/product-filtering/core/rules/buildFacetSet';
import { sanitizeFilterState } from '@/features/product-filtering/core/rules/sanitizeFilterState';
import { EMPTY_PICKLIST } from '@/features/product-filtering/core/definitions/picklist';
import type { Category } from '@/features/product-filtering/core/definitions/category';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { FilterQuery, ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';
import type { FacetPorts } from '@/features/product-filtering/core/ports';

export interface GetFilterFacetsOptions {
  /** The route's VFS key set. */
  keys: string[];
  /** The raw URL query — decoded here once the facet set it is vetted against is known. */
  query: FilterQuery;
  /** The route's top-level category. All Products has none and draws the headphones facets, as it always has. */
  category?: Category;
}

const EMPTY_FACET_SET: FacetSet = { groups: [], facets: [], queryOnly: [] };

const emptyFacets = (state: ProductQueryState): CatalogueFacets => ({
  groups: {},
  booleans: {},
  brandLabels: {},
  ranges: {},
  priceRange: { minPrice: null, maxPrice: null, prices: [] },
  isDefaultState: isDefaultFilterState(state, EMPTY_FACET_SET),
  facetSet: EMPTY_FACET_SET,
  state,
});

export async function getFilterFacets(
  ports: FacetPorts,
  { keys, query, category }: GetFilterFacetsOptions,
): Promise<CatalogueFacets> {
  if (!keys.length) return emptyFacets(ports.loadState(query));

  let products;
  let picklist;
  try {
    [products, picklist] = await Promise.all([
      ports.fetchProducts({ keys }),
      ports.fetchPicklist().catch((error) => {
        console.error('[getFilterFacets] Picklist read failed, no picked controls:', error);
        return EMPTY_PICKLIST;
      }),
    ]);
  } catch (error) {
    console.error(`[getFilterFacets] Failed for ${keys.length} keys:`, error);
    return emptyFacets(ports.loadState(query));
  }

  const scope = category ?? 'headphones';
  const facetSet = buildFacetSet(products, scope, picklist[scope]);
  const cleanState = sanitizeFilterState(ports.loadState(query, facetSet), facetSet);
  return computeCatalogueFacets(products, cleanState, facetSet);
}
