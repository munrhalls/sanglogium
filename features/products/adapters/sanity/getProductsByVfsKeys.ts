import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import { groq } from 'next-sanity';
import { cache } from 'react';
import { buildProductQuery } from '@/features/product-filtering/server';
import type { Product } from '@/features/products/core/types/productTypes';
import type { GetProductsCountOptions, GetProductsChunkOptions } from '@/features/products/core/types/productDataTypes';

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

// Count-only fetch, used to size pagination without fetching any product rows.
const getProductsCountFn = async ({ keys, state, facetSet }: GetProductsCountOptions): Promise<number> => {
  if (!keys.length) return 0;

  const { whereClause, params } = state ? buildProductQuery(state, facetSet) : { whereClause: '', params: {} };

  const countQuery = groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0${whereClause}])`;

  try {
    return (await sanityFetch<number>({ query: countQuery, params: { keys, ...params } })) ?? 0;
  } catch (error) {
    console.error(`[getProductsCount] Failed for ${keys.length} keys:`, error);
    return 0;
  }
};

export const getProductsCount = withCache(getProductsCountFn) as (
  options: GetProductsCountOptions
) => Promise<number>;

// Fetches one arbitrary offset/limit slice of products, for parallel per-chunk streaming.
const getProductsChunkFn = async ({ keys, offset, limit, state, facetSet }: GetProductsChunkOptions): Promise<Product[]> => {
  if (!keys.length || limit <= 0) return [];

  const { orderClause, whereClause, params } = state ? buildProductQuery(state, facetSet) : { orderClause: '', whereClause: '', params: {} };

  const end = offset + limit;
  const order = orderClause ? ` ${orderClause}` : '';
  const chunkQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0${whereClause}]${order} [${offset}...${end}] ${PRODUCT_PROJECTION}`;

  try {
    const products = await sanityFetch<Product[]>({ query: chunkQuery, params: { keys, ...params } });
    return products ?? [];
  } catch (error) {
    console.error(`[getProductsChunk] Failed for ${keys.length} keys, offset ${offset}, limit ${limit}:`, error);
    return [];
  }
};

export const getProductsChunk = withCache(getProductsChunkFn) as (
  options: GetProductsChunkOptions
) => Promise<Product[]>;
