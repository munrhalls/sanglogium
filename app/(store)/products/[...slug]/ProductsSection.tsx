import React from 'react';
import { ProductGrid } from '@/app/components/features/products';
import { CategoryPageClient } from './CategoryPageClient';
import type { Product } from '@/sanity/lib/products/getProductsByVfsKeys';
import type { FilterGroup } from '@/sanity/lib/products/filter/getFiltersForCategoryPath';

interface ProductsSectionProps {
  productsPromise: Promise<Product[]>;
  filtersPromise: Promise<FilterGroup[]>;
  categoryName: string;
}

export async function ProductsSection({
  productsPromise,
  filtersPromise,
  categoryName
}: ProductsSectionProps) {
  const [products, filters] = await Promise.all([productsPromise, filtersPromise]);

  return (
    <CategoryPageClient
      filters={filters}
      products={products}
      categoryName={categoryName}
    />
  );
}
