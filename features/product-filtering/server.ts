import "server-only";

// Server door: wires the Sanity adapters into the ports and exports the bound
// reads under today's names and signatures. Outside code imports these from
// '@/features/product-filtering/server' — never from adapters/ directly.

import { cache } from 'react';
import { fetchFacetProducts } from './adapters/sanity/getFilterFacets';
import { fetchCategoryPriceRange } from './adapters/sanity/getCategoryPriceRange';
import {
  getFilterFacets as getFilterFacetsQuery,
  type GetFilterFacetsOptions,
} from './queries/getFilterFacets';
import {
  getCategoryPriceRange as getCategoryPriceRangeQuery,
  type GetCategoryPriceRangeOptions,
} from './queries/getCategoryPriceRange';
import type { CatalogueFacets } from './core/rules/facetCounts';
import type { PriceRangeData } from './core/rules/priceBounds';

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

export const getCategoryPriceRange = withCache(
  (options: GetCategoryPriceRangeOptions): Promise<PriceRangeData> =>
    getCategoryPriceRangeQuery(fetchCategoryPriceRange, options),
);

export type { GetFilterFacetsOptions, GetCategoryPriceRangeOptions };
export { buildProductQuery } from './adapters/sanity/buildProductQuery';
