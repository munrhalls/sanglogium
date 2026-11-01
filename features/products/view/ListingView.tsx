import React from 'react';
import CategoryBreadcrumbsView from './CategoryBreadcrumbsView';
import { ShopHeader } from '@/features/products/ui/listing/ShopHeader';
import { NoResults } from '@/features/products/ui/listing/NoResults';
import { Pagination } from '@/features/products/ui/listing/Pagination';
import { ChunkedProductGrid } from '@/features/products/ui/listing/ChunkedProductGrid';
import { ProductChunkView } from './ProductChunkView';
import { FilterPanel, FilterSheet, ActiveFilters, SortControl } from '@/features/product-filtering';
import type { FilterPanelData } from '@/features/product-filtering';
import type { Product } from '@/features/products/core/types/productTypes';
import type { CardAction } from '@/features/products/ui/card/ProductCard';

interface ListingPageProps {
  title: string;
  overline?: string;
  breadcrumbs?: string[];
  breadcrumbLabels?: string[];
  filter: FilterPanelData;
  totalCount: number;
  totalPages: number;
  effectivePage: number;
  perPage: number;
  chunkPromises: Promise<Product[]>[];
  cardAction?: CardAction;
}

export default function ListingView({
  title,
  overline,
  breadcrumbs,
  breadcrumbLabels,
  filter,
  totalCount,
  totalPages,
  effectivePage,
  perPage,
  chunkPromises,
  cardAction,
}: ListingPageProps) {
  const hasPanel = filter.panel.sections.length > 0;
  const filtersActive = filter.chips.length > 0;

  return (
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pb-12">
      {breadcrumbs && <CategoryBreadcrumbsView categoryParts={breadcrumbs} labels={breadcrumbLabels ?? breadcrumbs} />}
      <ShopHeader title={title} overline={overline} />

      <div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">
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
          {filtersActive && (
            <div className="mb-4">
              <ActiveFilters key={filter.scope} model={filter.model} chips={filter.chips} />
            </div>
          )}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {hasPanel && <FilterSheet key={filter.scope} model={filter.model} panel={filter.panel} />}
              <span className="type-caption text-text-caption" aria-live="polite">
                {totalCount} {totalCount === 1 ? 'product' : 'products'}
              </span>
            </div>
            <SortControl key={filter.scope} model={filter.model} sort={filter.sort} />
          </div>
          {totalCount === 0 ? (
            <NoResults filtersActive={filtersActive} />
          ) : (
            <>
              <ChunkedProductGrid
                chunks={chunkPromises.map((promise, i) => (
                  <ProductChunkView
                    key={i}
                    promise={promise}
                    cardAction={cardAction}
                    priority={i === 0}
                  />
                ))}
              />
              <Pagination
                currentPage={effectivePage}
                totalPages={totalPages}
                totalCount={totalCount}
                perPage={perPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
