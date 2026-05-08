import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { FilterBuilder } from './FilterBuilder';
import { client } from './client';
import type { Product as SanityProduct } from '@/sanity.types';

// Pagination safety limit - prevents unbounded queries
const MAX_PRODUCTS_LIMIT = 100;

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};

// Product type using generated Sanity types - brand is now reference (SC8 complete)
export type Product = Pick<SanityProduct, '_id' | 'name' | 'price_data' | 'image' | 'catalogueLocationKeys' | 'brand'> & {
  slug: { current: string };
  stock: number;
  reservedStock: number;
  availableStock: number;
};

export interface GetProductsOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  limit?: number; // Optional override (capped at MAX_PRODUCTS_LIMIT)
}

const getProductsByVfsKeysFn = async ({
  keys,
  sort = 'featured',
  filters = [],
  limit = MAX_PRODUCTS_LIMIT
}: GetProductsOptions): Promise<Product[]> => {
  if (!keys.length) {
    return [];
  }

  // Cap limit at MAX_PRODUCTS_LIMIT for pagination safety
  const effectiveLimit = Math.min(limit, MAX_PRODUCTS_LIMIT);

  // Build sort clause
  const [sortField, sortDir] = sort.split(':');
  const orderClause = sort === 'featured'
    ? ''
    : `| order(${sortField} ${sortDir === 'asc' ? 'asc' : 'desc'})`;

  // Build filter clause using FilterBuilder
  const filterClause = FilterBuilder.buildClause(filters);

  const finalQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [0...${effectiveLimit}] {
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

  return sanityFetch({
    query: finalQuery,
    params: { keys }
  });
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<Product[]>;
