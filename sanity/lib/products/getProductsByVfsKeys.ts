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

  // Build filter clause - group same field filters with OR logic
  if (filters.length === 0) {
    var filterClause = '';
  } else {
    // Group filters by field
    const filtersByField = filters.reduce((acc, filter) => {
      const parts = filter.split(':');
      if (parts.length >= 2) {
        const field = parts[0];
        const value = parts.slice(1).join(':'); // Join remaining parts
        if (!acc[field]) acc[field] = [];
        acc[field].push(value);
      }
      return acc;
    }, {} as Record<string, string[]>);

    console.log('=== FILTER GROUPING DEBUG ===');
    console.log('input filters:', filters);
    console.log('filtersByField:', filtersByField);

    // Build clause for each field group
    const fieldClauses = Object.entries(filtersByField).map(([field, values]) => {
      console.log(`Building clause for field: ${field}, values:`, values);

      if (field === 'brand') {
        // Multiple brands: OR logic
        const brandConditions = values.map(value => `lower(brand->name) == lower("${value}")`).join(' || ');
        const clause = `&& (${brandConditions})`;
        console.log('brand clause:', clause);
        return clause;
      } else if (field === 'price') {
        // Price filtering: handle min/max values
        const priceConditions = values.map(value => {
          if (value.startsWith('min:')) {
            const minPrice = value.split(':')[1];
            return `displayPrice >= ${minPrice}`;
          } else if (value.startsWith('max:')) {
            const maxPrice = value.split(':')[1];
            return `displayPrice <= ${maxPrice}`;
          }
          return `displayPrice == ${value}`;
        }).join(' && ');
        const clause = `&& (${priceConditions})`;
        console.log('price clause:', clause);
        return clause;
      } else if (field === 'priceRange') {
        // Price range filtering: handle min/max values from slider
        const priceConditions = values.map(value => {
          if (value.startsWith('min:')) {
            const minPrice = value.split(':')[1];
            return `displayPrice >= ${minPrice}`;
          } else if (value.startsWith('max:')) {
            const maxPrice = value.split(':')[1];
            return `displayPrice <= ${maxPrice}`;
          }
          return `displayPrice == ${value}`;
        }).join(' && ');
        const clause = `&& (${priceConditions})`;
        console.log('priceRange clause:', clause);
        return clause;
      } else if (field === 'stockMin') {
        // Stock minimum filtering: handle stock values from slider
        const stockConditions = values.map(value => {
          const stockValue = parseInt(value, 10);
          // Note: Assuming stock field exists as 'stock' in product schema
          // If stock field doesn't exist, this will return 0 results
          return `stock >= ${stockValue}`;
        }).join(' && ');
        const clause = `&& (${stockConditions})`;
        console.log('stockMin clause:', clause);
        return clause;
      } else {
        // Other filters: OR logic within field
        const conditions = values.map(value =>
          `(count(overviewFields[@.title == "${field}" && @.value == "${value}"]) > 0 || count(specifications[@.title == "${field}" && @.value == "${value}"]) > 0)`
        ).join(' || ');
        const clause = `&& (${conditions})`;
        console.log('other clause:', clause);
        return clause;
      }
    });

    filterClause = fieldClauses.join(' ');
    console.log('=== FINAL FILTER CLAUSE ===');
    console.log('filterClause:', filterClause);
  }

  const finalQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [0...${effectiveLimit}] {
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
    }`;

  return sanityFetch({
    query: finalQuery,
    params: { keys }
  });
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<Product[]>;
