import React from 'react';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import type { FilterGroup } from '@/sanity/lib/products/filter/getFiltersForCategoryPath';

interface FilterSectionProps {
  filtersPromise: Promise<FilterGroup[]>;
}

export async function FilterSection({ filtersPromise }: FilterSectionProps) {
  const filters = await filtersPromise;
  
  return <FilterSidebar filters={filters} />;
}
