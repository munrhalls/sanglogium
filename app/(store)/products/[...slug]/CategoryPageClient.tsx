"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  categoryName?: string;
}

export function CategoryPageClient({
  filters,
  products,
  categoryName,
}: CategoryPageClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const searchParams = useSearchParams();

  // Parse sort from URL
  const sort = searchParams.get('sort') || 'featured';

  // Parse active filters from URL
  const activeFilters = useMemo(() => {
    const filterParams = searchParams.getAll('f');
    return filterParams.map(f => {
      const [field, value] = f.split(':');
      return { field, value };
    });
  }, [searchParams]);

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    if (activeFilters.length === 0) return products;

    return products.filter(product => {
      // Product must match ALL active filters (AND logic)
      return activeFilters.every(filter => {
        if (filter.field === 'brand') {
          return product.brand?.name === filter.value;
        }
        // For other filters, we'd need overviewFields/specifications data
        // For now, pass through (server-side filtering handles complex cases)
        return true;
      });
    });
  }, [products, activeFilters]);

  // Sort products client-side
  const sortedProducts = useMemo(() => {
    if (sort === 'featured') return filteredProducts;

    const [sortField, sortDir] = sort.split(':');
    const sorted = [...filteredProducts];

    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortField === 'displayPrice') {
        aVal = a.displayPrice;
        bVal = b.displayPrice;
      } else if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        return 0;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredProducts, sort]);

  const productCount = sortedProducts.length;
  const countLabel = productCount === 1 ? 'product' : 'products';

  return (
    <>
      {/* Mobile drawer */}
      <MobileFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
      />

      <main className="flex-1 min-w-0">
        {/* Desktop: Sort + Result count */}
        <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 mb-6 border-b border-border-secondary">
          <SortDropdown />
          <span className="type-metadata text-secondary">
            {productCount} {countLabel}
          </span>
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden">
          <MobileControlsBar
            productCount={sortedProducts.length}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} />

        <ProductGrid products={sortedProducts} />
      </main>
    </>
  );
}
