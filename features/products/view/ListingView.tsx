import React from 'react';
import CategoryBreadcrumbsView from './CategoryBreadcrumbsView';
import { ShopHeader } from '@/features/products/ui/listing/ShopHeader';
import { EmptyResults } from '@/features/products/ui/listing/EmptyResults';
import { Pagination } from '@/features/products/ui/listing/Pagination';
import { ChunkedProductGrid } from '@/features/products/ui/listing/ChunkedProductGrid';
import { ProductChunkView } from '@/features/products/view/listing/ProductChunkView';
import { FilterSidebar, SortBar, ActiveFilterChips } from '@/features/product-filtering';
import type { Category, CatalogueFacets } from '@/features/product-filtering';
import type { Product } from '@/features/products/core/rules/productTypes';

interface ListingPageProps {
  title: string;
  overline?: string;
  breadcrumbs?: string[];
  category?: Category;
  facets: CatalogueFacets;
  priceBounds: { min: number; max: number };
  filtersActive: boolean;
  totalCount: number;
  totalPages: number;
  effectivePage: number;
  perPage: number;
  chunkPromises: Promise<Product[]>[];
  wishlistProductIds: string[];
}

export default function ListingView({
  title,
  overline,
  breadcrumbs,
  category,
  facets,
  priceBounds,
  filtersActive,
  totalCount,
  totalPages,
  effectivePage,
  perPage,
  chunkPromises,
  wishlistProductIds,
}: ListingPageProps) {
  return (
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pb-12">
      {breadcrumbs && <CategoryBreadcrumbsView categoryParts={breadcrumbs} />}
      <ShopHeader title={title} overline={overline} />

      <div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">
        <FilterSidebar
          key={category}
          category={category}
          checkboxCounts={facets.groups}
          booleanCounts={facets.booleans}
          brandLabels={facets.brandLabels}
          priceBounds={{ min: priceBounds.min, max: priceBounds.max }}
          rangeBounds={category !== undefined ? facets.ranges : undefined}
          isDefaultState={facets.isDefaultState}
        />
        <div className="min-w-0 flex-1">
          <ActiveFilterChips key={category} category={category} brandLabels={facets.brandLabels} />
          <SortBar
            key={category}
            totalCount={totalCount}
            category={category}
            mobileFilterProps={{
              checkboxCounts: facets.groups,
              booleanCounts: facets.booleans,
              brandLabels: facets.brandLabels,
              priceBounds: { min: priceBounds.min, max: priceBounds.max },
              rangeBounds: category !== undefined ? facets.ranges : undefined,
              isDefaultState: facets.isDefaultState,
            }}
          />
          {totalCount === 0 ? (
            <EmptyResults filtersActive={filtersActive} />
          ) : (
            <>
              <ChunkedProductGrid
                chunks={chunkPromises.map((promise, i) => (
                  <ProductChunkView
                    key={i}
                    promise={promise}
                    wishlistProductIds={wishlistProductIds}
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
