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
  children: (props: { filters: FilterGroup[] }) => React.ReactNode;
}

export async function FilterConfigProvider({ categoryKeys, children }: FilterConfigProviderProps) {
  // Fetch dynamic filters based on category path
  const filters = await getFiltersForCategoryPathAction(categoryKeys);

  return <>{children({ filters })}</>;
}
