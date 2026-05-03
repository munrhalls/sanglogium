import { sanityFetch } from '@/sanity-config/lib/client';
import groq from 'groq';
import { cache } from 'react';

// React cache for Server Components
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

export interface FilterResult {
  filters: FilterGroup[];
  priceRange: {
    minPrice: number | null;
    maxPrice: number | null;
  };
  maxStock: number | null;
}

const getFiltersForCategoryPathFn = async (catalogueKeys: string[]): Promise<FilterResult> => {
  if (!catalogueKeys.length) {
    return {
      filters: [],
      priceRange: { minPrice: null, maxPrice: null },
      maxStock: null
    };
  }

  // Query price range using GROQ order and slicing (efficient alternative to aggregation)
  const minPriceQuery = await sanityFetch<{
    price_data: { unit_amount: number } | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount asc)[0] {
      price_data
    }`,
    params: { keys: catalogueKeys }
  });

  const maxPriceQuery = await sanityFetch<{
    price_data: { unit_amount: number } | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount desc)[0] {
      price_data
    }`,
    params: { keys: catalogueKeys }
  });

  const priceRange = {
    minPrice: minPriceQuery?.price_data?.unit_amount ?? null,
    maxPrice: maxPriceQuery?.price_data?.unit_amount ?? null
  };

  // Query maximum stock for slider upper bound
  const maxStockQuery = await sanityFetch<{
    stock: number | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(stock)] | order(stock desc)[0] {
      stock
    }`,
    params: { keys: catalogueKeys }
  });

  // Query products to extract unique filter values
  const products = await sanityFetch<any[]>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      price_data,
      brand->{name},
      stock
    }`,
    params: { keys: catalogueKeys }
  });


  if (!products.length) {
    return {
      filters: [],
      priceRange
    };
  }

  // Extract unique brands
  const brandSet = new Set<string>();
  const fieldMap = new Map<string, Set<string>>();

  for (const product of products) {
    // Collect brand names
    if (product.brand?.name) {
      brandSet.add(product.brand.name);
    }
  }

  // Build filter groups
  const filters: FilterGroup[] = [];

  // Brand filter (always include if any brands exist)
  if (brandSet.size > 0) {
    filters.push({
      field: 'brand',
      label: 'Brand',
      options: Array.from(brandSet)
        .sort()
        .map(brand => ({
          value: brand,
          label: brand
        }))
    });
  }

  // Add price filter if any price ranges exist
  const priceRanges = fieldMap.get('price');
  if (priceRanges && priceRanges.size > 0) {
    filters.push({
      field: 'price',
      label: 'Price Range',
      options: Array.from(priceRanges)
        .sort()
        .map(range => ({
          value: range,
          label: range
        }))
    });
  }

  // Add stock filter if any stock statuses exist
  const stockStatuses = fieldMap.get('stock');
  if (stockStatuses && stockStatuses.size > 0) {
    filters.push({
      field: 'stock',
      label: 'Availability',
      options: Array.from(stockStatuses)
        .sort()
        .map(status => ({
          value: status,
          label: status
        }))
    });
  }


  return {
    filters,
    priceRange,
    maxStock: maxStockQuery?.stock ?? null
  };
};

export const getFiltersForCategoryPath = withCache(getFiltersForCategoryPathFn);
