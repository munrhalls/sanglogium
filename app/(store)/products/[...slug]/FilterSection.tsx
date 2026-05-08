import React from 'react';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import type { FilterResult } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';

interface FilterSectionProps {
  filtersPromise: Promise<FilterResult>;
}

export async function FilterSection({ filtersPromise }: FilterSectionProps) {
  const filterResult = await filtersPromise;

  return <FilterSidebar filters={filterResult.filters} priceRange={filterResult.priceRange} maxStock={filterResult.maxStock} />;
}
