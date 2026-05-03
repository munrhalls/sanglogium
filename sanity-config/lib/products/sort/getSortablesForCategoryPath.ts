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

export interface SortOption {
  name: string;
  displayName: string;
  field: string;
  direction: 'asc' | 'desc';
}

const getSortablesForCategoryPathFn = async (catalogueKeys: string[]): Promise<SortOption[]> => {
  if (!catalogueKeys.length) {
    return [];
  }

  // Default sort options available for all categories
  const defaultSorts: SortOption[] = [
    { name: 'featured', displayName: 'Featured', field: 'featured', direction: 'desc' },
    { name: 'price-asc', displayName: 'Price: Low to High', field: 'unit_amount', direction: 'asc' },
    { name: 'price-desc', displayName: 'Price: High to Low', field: 'unit_amount', direction: 'desc' },
    { name: 'name-asc', displayName: 'Name: A to Z', field: 'name', direction: 'asc' },
    { name: 'name-desc', displayName: 'Name: Z to A', field: 'name', direction: 'desc' },
  ];

  // Try to fetch category-specific sortables from CMS
  try {
    const result = await sanityFetch<{
      sortOptions: Array<{
        name: string;
        displayName: string;
        field: string;
        defaultDirection: 'asc' | 'desc';
      }>;
    } | null>({
      query: groq`*[_type == "categorySortables" && categoryPath in $keys][0] {
        "sortOptions": sortOptions[] {
          name,
          displayName,
          field,
          defaultDirection
        }
      }`,
      params: { keys: catalogueKeys }
    });

    if (result?.sortOptions?.length) {
      return result.sortOptions.map(opt => ({
        name: opt.name,
        displayName: opt.displayName,
        field: opt.field,
        direction: opt.defaultDirection
      }));
    }
  } catch {
    // Fallback to defaults if query fails
  }

  return defaultSorts;
};

export const getSortablesForCategoryPath = withCache(getSortablesForCategoryPathFn);
