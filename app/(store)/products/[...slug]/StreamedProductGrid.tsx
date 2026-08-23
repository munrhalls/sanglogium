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

export function StreamedProductGrid({ keys, sort, filters, pageStart, rowCount, filterKey }: StreamedProductGridProps) {
  // Started, not awaited: awaiting here would gate every row's <Suspense> mount
  // on the wishlist lookup. Each row awaits this promise alongside its own slice
  // fetch, so the wishlist resolves in parallel instead of ahead of the grid.
  const wishlistPromise = getWishlistProductIds().then((ids) => new Set(ids));

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
            wishlistPromise={wishlistPromise}
          />
        </Suspense>
      ))}
    </div>
  );
}
