import React from 'react';
import { ProductCardReveal } from '@/app/components/features/products/ProductCardReveal';
import { ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';

/** Route-level Suspense fallback, before ProductRow's data fetch has even started. */
export function ProductRowSkeleton() {
  return (
    <>
      {Array.from({ length: ROW_SIZE }).map((_, i) => (
        <ProductCardReveal key={i} />
      ))}
    </>
  );
}
