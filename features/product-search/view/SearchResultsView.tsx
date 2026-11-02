import React from 'react';
import { SearchEmpty } from '@/features/product-search/ui/results/SearchEmpty';
import { SearchPagination } from '@/features/product-search/ui/results/SearchPagination';
import { SearchSort } from '@/features/product-search/ui/results/SearchSort';
import { SearchCategoryChips } from '@/features/product-search/ui/results/SearchCategoryChips';
import type { SearchResult } from '@/features/product-search/core/types/searchTypes';
import { NoResults, ProductGrid } from "@/features/products";
import type { CardAction } from "@/features/products";
import { FilterPanel, FilterSheet, ActiveFilters } from '@/features/product-filtering';
interface SearchResultsProps {
  resultsPromise: Promise<SearchResult>;
  cardAction?: CardAction;
  query: string;
}

export async function SearchResultsView({ resultsPromise, cardAction, query }: SearchResultsProps) {
  const { products, totalCount, unfilteredCount, filter, category, categoryCounts, allCategoriesCount } =
    await resultsPromise;

  // Nothing matches the words at all (filters can't be the cause).
  if (unfilteredCount === 0 || !filter) {
    return <SearchEmpty query={query} />;
  }

  const hasPanel = filter.panel.sections.length > 0;
  const filtersActive = filter.chips.length > 0;

  return (
    <div className="flex flex-col gap-8 lg-touch:flex-row lg-desktop:flex-row">
      {hasPanel && (
        <aside
          aria-label="Filters"
          className="hidden w-96 shrink-0 self-start sticky top-0 pt-6 pb-6 h-[calc(100dvh-var(--desktop-header-h)-var(--desktop-catalogue-nav-h))] lg-touch:flex lg-desktop:flex flex-col"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-secondary bg-surface-elevated">
            <FilterPanel key={filter.scope} model={filter.model} panel={filter.panel} />
          </div>
        </aside>
      )}
      <div className="min-w-0 flex-1">
        {categoryCounts && (
          <SearchCategoryChips counts={categoryCounts} active={category} allCount={allCategoriesCount ?? 0} />
        )}
        {filtersActive && (
          <div className="mb-4">
            <ActiveFilters key={filter.scope} model={filter.model} chips={filter.chips} />
          </div>
        )}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-secondary pb-4">
          <div className="flex items-center gap-3">
            {hasPanel && <FilterSheet key={filter.scope} model={filter.model} panel={filter.panel} />}
            <span className="type-metadata text-secondary" aria-live="polite">
              {totalCount} {totalCount === 1 ? 'product' : 'products'}
            </span>
          </div>
          <SearchSort />
        </div>
        {totalCount === 0 ? (
          <NoResults filtersActive={filtersActive} />
        ) : (
          <>
            <ProductGrid products={products} cardAction={cardAction} />
            <SearchPagination totalCount={totalCount} />
          </>
        )}
      </div>
    </div>
  );
}
