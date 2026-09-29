import React from 'react';
import { SearchEmpty } from '@/app/components/features/search/SearchEmpty';
import { SearchPagination } from '@/app/components/features/search/SearchPagination';
import { SearchSort } from '@/app/components/features/search/SearchSort';
import { SearchCategoryChips } from '@/app/components/features/search/SearchCategoryChips';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { MobileFilterSheet } from '@/app/components/features/filters/MobileFilterSheet';
import { ActiveFilterChips } from '@/app/components/features/filters/ActiveFilterChips';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { ProductGrid } from '@/app/components/features/products/ProductGrid';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
import { resolvePriceBounds } from '@/lib/catalogue/priceBounds';
import { isFiltersActive } from '@/lib/catalogue/buildProductQuery';
import { SORT_DEFAULT } from '@/lib/catalogue/filterSortParams';
import { getWishlistProductIds } from '@/lib/wishlist';
import type { SearchResult } from '@/sanity-cms/lib/products/searchProducts';

interface SearchResultsProps {
  resultsPromise: Promise<SearchResult>;
  query: string;
}

// Results span every category, so only the category-agnostic group applies.
const SEARCH_FILTER_GROUPS = ['commercial'];

export async function SearchResults({ resultsPromise, query }: SearchResultsProps) {
  const { products, totalCount, unfilteredCount, facets, priceRange, state, category, categoryCounts, allCategoriesCount } =
    await resultsPromise;
  const wishlistProductIds = await getWishlistProductIds();

  // Nothing matches the words at all (filters can't be the cause).
  if (unfilteredCount === 0) {
    return <SearchEmpty query={query} />;
  }

  const priceBounds = resolvePriceBounds(priceRange);
  const filtersActive = state ? isFiltersActive({ ...state, sort: SORT_DEFAULT }) : false;
  const panelProps = facets
    ? {
        checkboxCounts: facets.groups,
        booleanCounts: facets.booleans,
        brandLabels: facets.brandLabels,
        priceBounds: { min: priceBounds.min, max: priceBounds.max },
        isDefaultState: facets.isDefaultState,
        groupIds: SEARCH_FILTER_GROUPS,
      }
    : null;

  return (
    <div className="flex flex-col gap-8 lg-touch:flex-row lg-desktop:flex-row">
      {panelProps && <FilterSidebar {...panelProps} />}
      <div className="min-w-0 flex-1">
        {categoryCounts && (
          <SearchCategoryChips counts={categoryCounts} active={category} allCount={allCategoriesCount ?? 0} />
        )}
        {facets && <ActiveFilterChips brandLabels={facets.brandLabels} />}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-secondary pb-4">
          <div className="flex items-center gap-3">
            {panelProps && <MobileFilterSheet {...panelProps} totalCount={totalCount} />}
            <span className="type-metadata text-secondary" aria-live="polite">
              {totalCount} {totalCount === 1 ? 'product' : 'products'}
            </span>
          </div>
          <SearchSort />
        </div>
        {totalCount === 0 ? (
          <EmptyResults filtersActive={filtersActive} />
        ) : (
          <>
            <ProductGrid products={products} wishlistProductIds={wishlistProductIds} />
            <SearchPagination totalCount={totalCount} />
          </>
        )}
      </div>
    </div>
  );
}

/** Reserves the sidebar's width so the grid does not change width when results stream in. */
export function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg-touch:flex-row lg-desktop:flex-row">
      <div aria-hidden="true" className="hidden w-96 shrink-0 lg-touch:block lg-desktop:block" />
      <div className="min-w-0 flex-1">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
