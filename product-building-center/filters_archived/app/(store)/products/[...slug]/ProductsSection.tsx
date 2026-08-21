import React from 'react';
import { ProductsToolbar } from './ProductsToolbar';
import type { FilterResult } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';

interface ProductsSectionProps {
  filtersPromise: Promise<FilterResult>;
  categoryName: string;
}

export async function ProductsSection({
  filtersPromise,
  categoryName,
}: ProductsSectionProps) {
  const filterResult = await filtersPromise;

  return (
    <ProductsToolbar
      filters={filterResult.filters}
      priceRange={filterResult.priceRange}
      maxStock={filterResult.maxStock}
      categoryName={categoryName}
    />
  );
}
