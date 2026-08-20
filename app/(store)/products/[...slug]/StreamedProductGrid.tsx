import React, { Suspense } from 'react';
import { getWishlistProductIds } from '@/lib/wishlist';
import { ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';
import { ProductRow } from './ProductRow';
import { ProductRowSkeleton } from './ProductRowSkeleton';

interface StreamedProductGridProps {
  keys: string[];
  sort: string;
  filters: string[];
  pageStart: number;
  rowCount: number;
  filterKey: string;
}

export async function StreamedProductGrid({ keys, sort, filters, pageStart, rowCount, filterKey }: StreamedProductGridProps) {
  const wishlistProductIds = await getWishlistProductIds();
  const wishlistSet = new Set(wishlistProductIds);

  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: rowCount }).map((_, i) => (
        <Suspense key={`${filterKey}:${i}`} fallback={<ProductRowSkeleton />}>
          <ProductRow
            keys={keys}
            sort={sort}
            filters={filters}
            offset={pageStart + i * ROW_SIZE}
            limit={ROW_SIZE}
            wishlistSet={wishlistSet}
          />
        </Suspense>
      ))}
    </div>
  );
}
