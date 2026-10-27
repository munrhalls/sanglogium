import "server-only";

// Server door: wires the Sanity adapters into the ports and exports the bound
// reads under today's names and signatures. Outside code imports these from
// '@/features/product-filtering/server' — never from adapters/ directly.

import { cache } from 'react';
import { fetchFacetProducts } from './adapters/sanity/fetchFacetProducts';
import { fetchPicklist } from './adapters/sanity/fetchPicklist';
import { loadFacetFilterState } from './url/filterSortParams';
import {
  getFilterFacets as getFilterFacetsQuery,
  type GetFilterFacetsOptions,
} from './queries/getFilterFacets';
import type { CatalogueFacets } from './core/rules/facetCounts';
import type { FacetPorts } from './core/ports';

// React cache is only available in React Server Components; skip it elsewhere.
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

const facetPorts: FacetPorts = {
  fetchProducts: fetchFacetProducts,
  fetchPicklist,
  loadState: loadFacetFilterState,
};

export const getFilterFacets = withCache(
  (options: GetFilterFacetsOptions): Promise<CatalogueFacets> =>
    getFilterFacetsQuery(facetPorts, options),
);

export { buildProductQuery } from './adapters/sanity/buildProductQuery';
