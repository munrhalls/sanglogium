"use client";

import React, { useState } from 'react';
import { ProductGrid } from '@/app/components/features/products';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface Product {
  _id: string;
  name: string;
  brand?: { _id: string; name: string } | null;
  displayPrice: number;
  image: any;
  slug: { current: string };
}

interface CategoryPageClientProps {
  filters: FilterGroup[];
  products: Product[];
}

export function CategoryPageClient({
  filters,
  products,
}: CategoryPageClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
      />

      <main className="flex-1 min-w-0">
        {/* Desktop: Sort + Active filters */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-6 border-b border-border-secondary">
          <SortDropdown />
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden">
          <MobileControlsBar
            productCount={products.length}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} />

        <ProductGrid products={products} />
      </main>
    </>
  );
}
