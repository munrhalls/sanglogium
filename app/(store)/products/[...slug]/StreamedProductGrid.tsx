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
  //
  // Every row shares this one promise, so if the wishlist lookup (session +
  // Sanity fetch) ever stalls, it head-of-line-blocks the entire grid forever
  // — product data would be ready but every row stays on its skeleton because
  // Promise.all([slice, wishlistPromise]) never settles. Race it against a
  // timeout so a slow/hung wishlist lookup degrades to "nothing wishlisted"
  // instead of freezing the page.
  const wishlistPromise = Promise.race([
    getWishlistProductIds().then((ids) => new Set(ids)),
    new Promise<Set<string>>((resolve) => setTimeout(() => resolve(new Set()), 2000)),
  ]);

  // Deliberate reveal pacing: row i can't resolve before i * ROW_STAGGER_MS.
  // Without this, rows fetched concurrently against a fast/local Sanity often
  // all settle inside the same tick and paint as one flat "everything at
  // once" reveal instead of a progressive one — see product-grid-streaming-ux-bugs
  // Problem 3. A no-op once real network latency already exceeds the floor.
  const ROW_STAGGER_MS = 200;

  return (
    <div className="grid gap-8 grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2">
      {Array.from({ length: rowCount }).map((_, i) => (
        <Suspense key={`${filterKey}:${i}`} fallback={<ProductRowSkeleton />}>
          <ProductRow
            keys={keys}
            sort={sort}
            filters={filters}
            offset={pageStart + i * ROW_SIZE}
            limit={ROW_SIZE}
            wishlistPromise={wishlistPromise}
            minDelayMs={i * ROW_STAGGER_MS}
          />
        </Suspense>
      ))}
    </div>
  );
}
