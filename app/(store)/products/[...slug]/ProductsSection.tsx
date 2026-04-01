import React from 'react';
import { ProductGrid } from '@/app/components/features/products';
import { CategoryPageClient } from './CategoryPageClient';
import type { Product } from '@/sanity/lib/products/getProductsByVfsKeys';
import type { FilterResult } from '@/sanity/lib/products/filter/getFiltersForCategoryPath';

interface ProductsSectionProps {
  productsPromise: Promise<Product[]>;
  filtersPromise: Promise<FilterResult>;
  categoryName: string;
}

export async function ProductsSection({
  productsPromise,
  filtersPromise,
  categoryName
}: ProductsSectionProps) {
  const [products, filterResult] = await Promise.all([productsPromise, filtersPromise]);

  return (
    <CategoryPageClient
      filters={filterResult.filters}
      priceRange={filterResult.priceRange}
      maxStock={filterResult.maxStock}
      products={products}
      categoryName={categoryName}
    />
  );
}
