import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import { groq } from 'next-sanity';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';
import type { FacetSource } from '@/features/product-filtering/core/ports';
import { CATALOGUE_FETCH_CACHE } from './catalogueCache';

/**
 * Fetch the facet-relevant projection for a route's VFS key set. Throws on a
 * failed fetch — the empty/fallback decision lives in queries/getFilterFacets.
 * Served from the Data Cache (see catalogueCache.ts), so a filter change does
 * not refetch it.
 */
export const fetchFacetProducts: FacetSource = async ({ keys }) => {
  const query = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] {
    _id,
    filterAttributes,
    "brandRef": brand->{ name, "slug": slug.current },
    "price": price_data.unit_amount,
    stock,
    reservedStock
  }`;

  return (await sanityFetch<RawProduct[]>({ query, params: { keys }, next: CATALOGUE_FETCH_CACHE })) ?? [];
};
