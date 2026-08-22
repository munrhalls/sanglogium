import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import type { Product } from './getProductsByVfsKeys';

// Streaming blueprint constants.
export const ROW_SIZE = 8;
export const PER_PAGE = 24;

export interface GetProductsCountOptions {
  keys: string[];
  filters?: string[];
}

export interface GetProductsSliceOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  offset: number;
  limit: number;
}

export async function getProductsCount({ keys, filters = [] }: GetProductsCountOptions): Promise<number> {
  if (!keys.length) return 0;
  const countQuery = groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0])`;
  try {
    return (await sanityFetch<number>({ query: countQuery, params: { keys } })) ?? 0;
  } catch (error) {
    console.error('[getProductsCount] Failed:', error);
    return 0;
  }
}

export async function getProductsSlice({ keys, sort = 'featured', filters = [], offset, limit }: GetProductsSliceOptions): Promise<Product[]> {
  if (!keys.length) return [];
  // EXCLUSIVE slice: two dots -> exactly `limit` items (offset..offset+limit).
  const productsQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] [${offset}..${offset + limit}] {
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
      asset {
        _ref
      }
    },
    slug {
      current
    },
    catalogueLocationKeys
  }`;
  try {
    return (await sanityFetch<Product[]>({ query: productsQuery, params: { keys } })) ?? [];
  } catch (error) {
    console.error('[getProductsSlice] Failed:', error);
    return [];
  }
}
