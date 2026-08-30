import React from 'react';

interface ProductChunkSkeletonProps {
  count: number;
}

// Sized to match ProductCard's real dimensions (aspect-[4/3] image + text block)
// so chunks don't jitter the layout as they resolve. Renders as loose grid
// children (no wrapper) so it slots directly into the parent's grid.
export function ProductChunkSkeleton({ count }: ProductChunkSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card-product-dark h-full min-w-0 flex flex-col overflow-hidden !p-0 animate-pulse"
          data-testid="product-chunk-skeleton"
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
    </>
  );
}
