import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { cache } from 'react';
import { computeCatalogueFacets, isDefaultFilterState } from '@/features/product-filtering/domain';
import type { CatalogueFacets, RawProduct, ProductQueryState } from '@/features/product-filtering';

const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

export interface GetFilterFacetsOptions {
  /** The route's VFS key set. */
  keys: string[];
  /** The active filter/sort state (used to compute disjunctive counts). */
  state: ProductQueryState;
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
    return { groups: {}, booleans: {}, brandLabels: {}, ranges: {}, isDefaultState: isDefaultFilterState(state) };
  }

  return computeCatalogueFacets(products, state);
};

export const getFilterFacets = withCache(getFilterFacetsFn) as (
  options: GetFilterFacetsOptions,
) => Promise<CatalogueFacets>;
