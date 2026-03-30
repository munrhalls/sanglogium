import React from 'react';
import { cn } from "@/lib/utils/tailwind";
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 12,
  className
}: ProductGridSkeletonProps) {
  return (
    <div
      data-testid="product-grid-skeleton"
      className={cn(
        "grid gap-4 md:gap-6 lg:gap-8",
        "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
