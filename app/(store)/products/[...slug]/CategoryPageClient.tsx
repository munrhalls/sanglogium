"use client";

import React, { useState } from 'react';
import { ProductGrid } from '@/app/components/features/products';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';
import { useFilterPending } from '@/app/components/features/filters/useFilterNuqs';
import { Pagination } from '@/app/components/features/products/Pagination';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { totalPagesFor } from '@/lib/catalogue/pagination';
// Product type is passed through from server; ProductGrid has its own compatible local type

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface CategoryPageClientProps {
  filters: FilterGroup[];
  priceRange: { minPrice: number | null; maxPrice: number | null };
  maxStock: number | null;
  products: any[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  categoryName?: string;
}

export function CategoryPageClient({
  filters,
  priceRange,
  maxStock,
  products,
  totalCount,
  currentPage,
  perPage,
  categoryName,
}: CategoryPageClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isPending = useFilterPending();
  // Products are filtered server-side; totalCount is the full filtered total
  // across all pages (not just the current window).
  const productCount = totalCount;
  const countLabel = productCount === 1 ? 'product' : 'products';
  const totalPages = totalPagesFor(totalCount, perPage);

  return (
    <>
      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
        priceRange={priceRange}
        maxStock={maxStock}
      />

      <div className="min-w-0">
        {/* Desktop: Sort + Result count */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-6 border-b border-border-secondary">
          <SortDropdown />
          <span className="type-metadata text-secondary">
            {productCount} {countLabel} {isPending && '(Loading...)'}
          </span>
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden">
          <MobileControlsBar
            productCount={totalCount}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} />

        <div className={isPending ? 'opacity-60 transition-opacity pointer-events-none' : 'transition-opacity'}>
          {totalCount === 0 ? <EmptyResults /> : <ProductGrid products={products} />}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </>
  );
}
