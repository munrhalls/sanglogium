import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';
import { cache } from 'react';
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
export type Product = Pick<SanityProduct, '_id' | 'name' | 'displayPrice' | 'image' | 'catalogueLocationKeys' | 'brand'> & {
  slug: { current: string };
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

  // Build filter clause
  const filterClause = filters.length > 0
    ? filters.map(f => {
        const [field, value] = f.split(':');
        // Brand is now a reference - filter by brand name via dereference
        if (field === 'brand') {
          return `&& brand->name == "${value}"`;
        }
        // Other filters check both overviewFields and specifications arrays
        return `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`;
      }).join(' ')
    : '';

  const results = await sanityFetch({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [0...${effectiveLimit}] {
      _id,
      name,
      brand->{
        _id,
        name,
        slug
      },
      displayPrice,
      image {
        asset {
          _ref
        }
      },
      slug {
        current
      },
      catalogueLocationKeys
    }`,
    params: { keys }
  });

  // Debug: Log first product's image data to verify structure
  if (results.length > 0) {
    console.log('[DEBUG getProductsByVfsKeys] First product image:', JSON.stringify(results[0].image, null, 2));
  }

  return results;
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<Product[]>;
