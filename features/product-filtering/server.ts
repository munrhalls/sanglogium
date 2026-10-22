import "server-only";

// Server door: wires the Sanity adapters into the ports and exports the bound
// reads under today's names and signatures. Outside code imports these from
// '@/features/product-filtering/server' — never from adapters/ directly.

import { cache } from 'react';
import { fetchFacetProducts } from './adapters/sanity/fetchFacetProducts';
import {
  getFilterFacets as getFilterFacetsQuery,
  type GetFilterFacetsOptions,
} from './queries/getFilterFacets';
import type { CatalogueFacets } from './core/rules/facetCounts';

// React cache is only available in React Server Components; skip it elsewhere.
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

export const getFilterFacets = withCache(
  (options: GetFilterFacetsOptions): Promise<CatalogueFacets> =>
    getFilterFacetsQuery(fetchFacetProducts, options),
);

export { buildProductQuery } from './adapters/sanity/buildProductQuery';
