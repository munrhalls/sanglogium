import React from 'react';
import { ProductCardSkeleton } from '@/app/components/features/products';

export function ProductRowSkeleton() {
  return (
    <div className="grid gap-8 grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
