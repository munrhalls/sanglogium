import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import { groq } from 'next-sanity';
import { cache } from 'react';
import type { Product as SanityProduct } from '@/sanity.types';
import { CATALOGUE_FETCH_CACHE } from '@/features/product-filtering/server';
import type { Product } from '@/features/products/core/types/productTypes';
import type {
  GetNarrowedChunkOptions,
  GetNarrowedCountOptions,
} from '@/features/products/core/types/productDataTypes';

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

const PRODUCT_PROJECTION = groq`{
  _id,
  name,
  brand->{
    _id,
    name,
    slug
  },
  price_data,
  stock,
  reservedStock,
  "availableStock": stock - reservedStock,
  image {
    asset-> {
      _id,
      metadata { lqip, isOpaque }
    }
  },
  slug {
    current
  },
  catalogueLocationKeys
}`;

// Two reads, narrowed by the filter feature: its `where` (the text `true` when nothing is selected), its `order` and its named parameters are embedded in the route's request.
// They are served under the same Data Cache rules as the route's controls and counts (CATALOGUE_FETCH_CACHE), so the grid and the numbers beside the options are as old as each other
// and both are cleared by the same publish tag.
const getNarrowedCountFn = async ({ keys, narrowing }: GetNarrowedCountOptions): Promise<number> => {
  if (!keys.length) return 0;

  const countQuery = groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && (${narrowing.where})])`;

  try {
    return (await sanityFetch<number>({ query: countQuery, params: { keys, ...narrowing.params }, next: CATALOGUE_FETCH_CACHE })) ?? 0;
  } catch (error) {
    console.error(`[getNarrowedCount] Failed for ${keys.length} keys:`, error);
    return 0;
  }
};

export const getNarrowedCount = withCache(getNarrowedCountFn) as (
  options: GetNarrowedCountOptions
) => Promise<number>;

const getNarrowedChunkFn = async ({ keys, narrowing, offset, limit }: GetNarrowedChunkOptions): Promise<Product[]> => {
  if (!keys.length || limit <= 0) return [];

  const end = offset + limit;
  const chunkQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && (${narrowing.where})] | order(${narrowing.order}) [${offset}...${end}] ${PRODUCT_PROJECTION}`;

  try {
    const products = await sanityFetch<Product[]>({ query: chunkQuery, params: { keys, ...narrowing.params }, next: CATALOGUE_FETCH_CACHE });
    return products ?? [];
  } catch (error) {
    console.error(`[getNarrowedChunk] Failed for ${keys.length} keys, offset ${offset}, limit ${limit}:`, error);
    return [];
  }
};

export const getNarrowedChunk = withCache(getNarrowedChunkFn) as (
  options: GetNarrowedChunkOptions
) => Promise<Product[]>;
