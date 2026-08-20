import React from 'react';
import { ProductsToolbar } from './ProductsToolbar';
import type { FilterResult } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';

interface ProductsSectionProps {
  filtersPromise: Promise<FilterResult>;
  totalCount: number;
  categoryName: string;
}

export async function ProductsSection({
  filtersPromise,
  totalCount,
  categoryName,
}: ProductsSectionProps) {
  const filterResult = await filtersPromise;

  return (
    <ProductsToolbar
      filters={filterResult.filters}
      priceRange={filterResult.priceRange}
      maxStock={filterResult.maxStock}
      totalCount={totalCount}
      categoryName={categoryName}
    />
  );
}
