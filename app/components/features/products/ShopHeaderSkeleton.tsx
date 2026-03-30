import React from 'react';

export function ShopHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6 animate-pulse">
      {/* Title placeholder */}
      <div
        data-testid="skeleton-header-title"
        className="h-8 bg-gray-200 rounded w-1/3"
      />

      {/* Count placeholder */}
      <div
        data-testid="skeleton-header-count"
        className="h-4 bg-gray-200 rounded w-1/6"
      />
    </div>
  );
}
