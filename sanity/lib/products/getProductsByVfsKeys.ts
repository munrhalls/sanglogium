import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = (fn: Function): Function => {
  try {
    // Dynamic import to avoid breaking in non-React environments
    const { cache } = require('react');
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
        // Handle brand filter specially
        if (field === 'brand') {
          return `&& brand->name == "${value}"`;
        }
        return `&& ${field} == "${value}"`;
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
      image,
      slug {
        current
      },
      catalogueLocationKeys
    }`,
    params: { keys }
  });
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<Product[]>;
