import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div
      data-testid="product-card-skeleton"
      className="card-product-dark flex flex-col"
    >
      {/* Image placeholder */}
      <div
        data-testid="skeleton-image"
        className="aspect-[16/9] bg-surface-productImage animate-pulse"
      />

      {/* Content area matching ProductCard structure */}
      <div className="flex flex-col gap-3 p-3">
        {/* Title placeholder */}
        <div
          data-testid="skeleton-title"
          className="h-4 bg-secondary-800 rounded w-full animate-pulse"
        />

        {/* Price + CTA row */}
        <div className="flex items-center justify-between pt-2">
          <div
            data-testid="skeleton-price"
            className="h-4 bg-secondary-800 rounded w-1/4 animate-pulse"
          />
          <div
            data-testid="skeleton-button"
            className="h-8 bg-secondary-800 rounded w-16 animate-pulse"
          />
        </div>
      </div>
    </div>
  );
}
