"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/app/components/features/products';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import { ActiveFilters } from '@/app/components/features/filters/ActiveFilters';
import { MobileControlsBar } from '@/app/components/features/filters/MobileControlsBar';
import { MobileFilterDrawer } from '@/app/components/features/filters/MobileFilterDrawer';
import type { SanityProduct } from '@/sanity/lib/products/getProductsByVfsKeys';

// Product type aligned with Sanity generated types - brand is now reference (SC8)
type Product = Pick<SanityProduct, '_id' | 'name' | 'displayPrice' | 'image'> & {
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  slug: { current: string };
};

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
  products: Product[];
  categoryName?: string;
}

export function CategoryPageClient({
  filters,
  priceRange,
  maxStock,
  products,
  categoryName,
}: CategoryPageClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const searchParams = useSearchParams();

  // Parse active filters from URL for display purposes only
  const activeFilters = useMemo(() => {
    const filterParams = searchParams.getAll('f');
    return filterParams.map(f => {
      const [field, value] = f.split(':');
      return { field, value };
    });
  }, [searchParams]);

  // Products are already filtered server-side via GROQ
  const productCount = products.length;
  const countLabel = productCount === 1 ? 'product' : 'products';

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

      <div className="flex-1 min-w-0">
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
            productCount={products.length}
            onOpenFilters={() => setIsDrawerOpen(true)}
          />
        </div>

        {/* Active filters */}
        <ActiveFilters filterGroups={filters} activeFilters={activeFilters} />

        <ProductGrid products={products} />
      </div>
    </>
  );
}
