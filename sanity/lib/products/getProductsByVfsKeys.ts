import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';
import { cache } from 'react';

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};

export interface Product {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
  };
  displayPrice: number;
  image: any;
  slug: {
    current: string;
  };
  catalogueLocationKeys: string[];
}

export interface GetProductsOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
}

const getProductsByVfsKeysFn = async ({
  keys,
  sort = 'featured',
  filters = []
}: GetProductsOptions): Promise<Product[]> => {
  if (!keys.length) {
    return [];
  }

  // Build sort clause
  const [sortField, sortDir] = sort.split(':');
  const orderClause = sort === 'featured'
    ? ''
    : `| order(${sortField} ${sortDir === 'asc' ? 'asc' : 'desc'})`;

  // Build filter clause
  const filterClause = filters.length > 0
    ? filters.map(f => {
        const [field, value] = f.split(':');
        // Brand is a string field (not reference)
        if (field === 'brand') {
          return `&& brand == "${value}"`;
        }
        // Other filters check both overviewFields and specifications arrays
        return `&& (count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`;
      }).join(' ')
    : '';

  return sanityFetch({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} {
      _id,
      name,
      brand {
        _id,
        name
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
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<Product[]>;
