import React from 'react';

export function ShopHeaderSkeleton() {
  return (
    <div className="animate-pulse" data-testid="shop-header-skeleton">
      {/* Overline placeholder */}
      <div className="h-3 w-32 bg-surface-elevated rounded mb-2" />
      
      {/* Title placeholder */}
      <div className="h-8 w-48 bg-surface-elevated rounded" />
    </div>
  );
}
