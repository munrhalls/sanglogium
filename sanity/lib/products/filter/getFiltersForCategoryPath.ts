import { sanityFetch } from '@/sanity/lib/client';
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

const getFiltersForCategoryPathFn = async (catalogueKeys: string[]): Promise<FilterGroup[]> => {
  if (!catalogueKeys.length) {
    return [];
  }

  // Query products to extract unique filter values
  const products = await sanityFetch<{
    displayPrice: number | null;
    brand: string | null;
    stock: number | null;
  }[]>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      displayPrice,
      brand,
      stock
    }`,
    params: { keys: catalogueKeys }
  });

  if (!products.length) {
    return [];
  }

  // Extract unique brands
  const brandSet = new Set<string>();
  const fieldMap = new Map<string, Set<string>>();

  for (const product of products) {
    // Collect brand names
    if (product.brand) {
      brandSet.add(product.brand);
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

  // Process other fields from products
  for (const product of products) {
    if (product.displayPrice !== null) {
      const priceRanges = fieldMap.get('price') || new Set<string>();
      if (product.displayPrice < 100) priceRanges.add('Under $100');
      else if (product.displayPrice < 500) priceRanges.add('$100-$500');
      else if (product.displayPrice < 1000) priceRanges.add('$500-$1000');
      else priceRanges.add('Over $1000');
      fieldMap.set('price', priceRanges);
    }

    if (product.stock !== null) {
      const stockStatus = fieldMap.get('stock') || new Set<string>();
      if (product.stock > 0) stockStatus.add('In Stock');
      else stockStatus.add('Out of Stock');
      fieldMap.set('stock', stockStatus);
    }
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


  return filters;
};

export const getFiltersForCategoryPath = withCache(getFiltersForCategoryPathFn);
