import React from 'react';
import { getFiltersForCategoryPathAction } from '@/app/actions/categories';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface FilterConfigProviderProps {
  categoryKeys: string[];
  children: (props: { filters: FilterGroup[]; priceRange: { minPrice: number | null; maxPrice: number | null } }) => React.ReactNode;
}

export async function FilterConfigProvider({ categoryKeys, children }: FilterConfigProviderProps) {
  // Fetch dynamic filters based on category path
  const filterResult = await getFiltersForCategoryPathAction(categoryKeys);

  return <>{children({ filters: filterResult.filters, priceRange: filterResult.priceRange })}</>;
}
