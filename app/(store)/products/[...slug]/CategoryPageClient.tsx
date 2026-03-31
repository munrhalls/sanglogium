"use client";

import React, { useState } from 'react';
import { ShopHeader, ProductGrid } from '@/app/components/features/products';
import {
  FilterSidebar,
  SortDropdown,
  ActiveFilters,
  MobileControlsBar,
  MobileFilterDrawer,
} from '@/app/components/features/filters';

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
  categoryName: string;
}

export function CategoryPageClient({
  filters,
  products,
  categoryName,
}: CategoryPageClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <FilterSidebar filters={filters} />
      </div>

      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Desktop header */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <ShopHeader title={categoryName} productCount={products.length} />
          <SortDropdown />
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden">
          <ShopHeader title={categoryName} productCount={products.length} />
          <MobileControlsBar
            productCount={products.length}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters
          filters={[
            { field: 'brand', value: 'sennheiser', label: 'Brand: Sennheiser' },
            { field: 'driverType', value: 'dynamic', label: 'Driver: Dynamic' },
          ]}
        />

        <ProductGrid products={products} />
      </main>
    </div>
  );
}
