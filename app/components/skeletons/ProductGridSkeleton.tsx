import React from 'react';
import { productGridClass } from '@/app/components/features/products/gridLayout';

// Sized and laid out to match the loaded ProductGrid exactly (same shared grid
// class, same aspect-[4/3] image box + text block as ProductCard) so the
// initial paint doesn't shift when results arrive.
export function ProductGridSkeleton() {
  return (
    <div className={productGridClass} data-testid="product-grid-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="card-product-dark h-full min-w-0 flex flex-col overflow-hidden !p-0 animate-pulse"
        >
          <div className="aspect-[4/3] w-full bg-surface-elevated" />

          <div className="flex flex-col flex-grow gap-1 p-3">
            <div className="h-9 w-full bg-surface-elevated rounded" />
          </div>

          <div className="flex items-center gap-2 px-3 pb-3">
            <div className="h-3.5 w-16 bg-surface-elevated rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
