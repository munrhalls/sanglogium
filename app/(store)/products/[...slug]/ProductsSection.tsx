import React from 'react';
import { CategoryPageClient } from './CategoryPageClient';
import { DEFAULT_PER_PAGE } from '@/lib/catalogue/filterParams';
import { getWishlistProductIds } from '@/lib/wishlist';
import type { PaginatedProducts } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import type { FilterResult } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';

interface ProductsSectionProps {
  productsPromise: Promise<PaginatedProducts>;
  filtersPromise: Promise<FilterResult>;
  categoryName: string;
  currentPage: number;
}

export async function ProductsSection({
  productsPromise,
  filtersPromise,
  categoryName,
  currentPage
}: ProductsSectionProps) {
  const [{ products, totalCount }, filterResult, wishlistProductIds] = await Promise.all([
    productsPromise,
    filtersPromise,
    getWishlistProductIds()
  ]);

  return (
    <CategoryPageClient
      filters={filterResult.filters}
      priceRange={filterResult.priceRange}
      maxStock={filterResult.maxStock}
      products={products}
      totalCount={totalCount}
      currentPage={currentPage}
      perPage={DEFAULT_PER_PAGE}
      categoryName={categoryName}
      wishlistProductIds={wishlistProductIds}
    />
  );
}
