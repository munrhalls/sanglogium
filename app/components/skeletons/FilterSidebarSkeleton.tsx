import React from 'react';

export function FilterSidebarSkeleton() {
  return (
    <div className="w-full animate-pulse" data-testid="filter-sidebar-skeleton">
      {/* Filter groups */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-6">
          {/* Filter group title */}
          <div className="h-4 w-24 bg-surface-elevated rounded mb-3" />
          
          {/* Filter options */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-surface-elevated rounded" />
                <div className="h-3 w-20 bg-surface-elevated rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
