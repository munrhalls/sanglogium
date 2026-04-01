import React from 'react';

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="product-grid-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="card-product-dark h-full flex flex-col animate-pulse"
        >
          {/* Image placeholder */}
          <div className="aspect-[4/3] bg-surface-elevated" />
          
          {/* Content placeholder */}
          <div className="flex flex-col flex-grow p-4 gap-3">
            {/* Brand placeholder */}
            <div className="h-4 w-20 bg-surface-elevated rounded" />
            
            {/* Name placeholder */}
            <div className="h-5 w-full bg-surface-elevated rounded" />
            
            {/* Price placeholder */}
            <div className="h-4 w-24 bg-surface-elevated rounded mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
