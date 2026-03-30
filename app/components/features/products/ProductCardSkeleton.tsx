import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div
      data-testid="product-card-skeleton"
      className="space-y-3 animate-pulse"
    >
      {/* Image placeholder */}
      <div
        data-testid="skeleton-image"
        className="aspect-[4/3] bg-gray-200 rounded"
      />

      {/* Brand placeholder */}
      <div
        data-testid="skeleton-brand"
        className="h-4 bg-gray-200 rounded w-1/3"
      />

      {/* Title placeholder */}
      <div
        data-testid="skeleton-title"
        className="h-5 bg-gray-200 rounded w-full"
      />

      {/* Price placeholder */}
      <div
        data-testid="skeleton-price"
        className="h-5 bg-gray-200 rounded w-1/4"
      />
    </div>
  );
}
