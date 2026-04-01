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

  // Add other fields as filters
  const fieldLabelMap: Record<string, string> = {
    'driverType': 'Driver Type',
    'driverSize': 'Driver Size',
    'impedance': 'Impedance',
    'frequencyResponse': 'Frequency Response',
    'connection': 'Connection',
    'openClosed': 'Design',
  };

  for (const [field, values] of fieldMap) {
    if (values.size > 0 && values.size < products.length) {
      // Only add filter if there are multiple values but not every product has it
      filters.push({
        field: field.toLowerCase(),
        label: fieldLabelMap[field] || field,
        options: Array.from(values)
          .sort()
          .map(value => ({
            value,
            label: value
          }))
      });
    }
  }

  return filters;
};

export const getFiltersForCategoryPath = withCache(getFiltersForCategoryPathFn);
