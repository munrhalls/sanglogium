import React, { Suspense } from 'react';
import { getAllLeafKeys } from '@/data/catalogue';
import { getProductsCount, PER_PAGE, ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';
import { getFiltersForCategoryPath, getValidFilterFields } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';
import { loadCategorySearchParams } from '@/lib/catalogue/searchParams';
import { stripUnknownFilters } from '@/lib/catalogue/filterUtils';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { FilterSection } from './[...slug]/FilterSection';
import { ProductsSection } from './[...slug]/ProductsSection';
import { FilterSidebarSkeleton } from '@/app/components/skeletons/FilterSidebarSkeleton';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { StreamedProductGrid } from './[...slug]/StreamedProductGrid';
import { isFacetedQuery } from '@/lib/catalogue/seo';

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  const { sort, f: filters, page } = loadCategorySearchParams({
    ...query,
    f: Array.isArray(query.f) ? query.f.join(',') : query.f,
  });

  const allKeys = getAllLeafKeys();

  // Strip stale/unknown `?f=` fields BEFORE querying (G3) so SSR never flashes
  // an empty grid for shared/crawled URLs; the client effect stays as a backstop.
  const validFields = await getValidFilterFields(allKeys);
  const cleanedFilters = stripUnknownFilters(filters, validFields);

  const filtersPromise = getFiltersForCategoryPath(allKeys, cleanedFilters);
  const totalCount = await getProductsCount({ keys: allKeys, filters: cleanedFilters });
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PER_PAGE) : 0;
  const effectivePage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : page;
  const isPageOutOfRange = totalPages > 0 && page > totalPages;
  const pageStart = (effectivePage - 1) * PER_PAGE;
  const rowCount = totalCount === 0 ? 0 : Math.ceil(Math.min(PER_PAGE, totalCount - pageStart) / ROW_SIZE);
  const filterKey = [sort, cleanedFilters.join(','), effectivePage].join('|');

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8 items-stretch">
        <aside className="hidden lg-desktop:block lg-touch:block sticky top-[var(--desktop-header-h)] h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto scrollbar-none pt-6 self-start">
          <Suspense fallback={<FilterSidebarSkeleton />}>
            <FilterSection filtersPromise={filtersPromise} />
          </Suspense>
        </aside>
        <main className="min-w-0 w-full pt-6">
          <div className="pb-4">
            <ShopHeader title="All Products" />
          </div>
          <Suspense fallback={null}>
            <ProductsSection
              filtersPromise={filtersPromise}
              totalCount={totalCount}
              categoryName="All Products"
            />
          </Suspense>
          {totalCount === 0 ? (
            <EmptyResults />
          ) : (
            <>
              {isPageOutOfRange && (
                <div
                  role="status"
                  data-testid="page-out-of-range"
                  className="mb-4 rounded-md border border-warning-500/40 bg-warning-500/10 px-4 py-3 type-body text-warning-500"
                >
                  The page you requested is out of range. Showing the last page of results.
                </div>
              )}
              <StreamedProductGrid
                keys={allKeys}
                sort={sort}
                filters={cleanedFilters}
                pageStart={pageStart}
                rowCount={rowCount}
                filterKey={filterKey}
              />
            </>
          )}
          <Pagination
            currentPage={effectivePage}
            totalPages={totalPages}
            totalCount={totalCount}
            perPage={PER_PAGE}
          />
        </main>
      </div>
    </div>
  );
}

export async function generateMetadata({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  return {
    title: 'All Products — Sang Logium',
    description: 'Browse the full Sang Logium catalogue of headphones, audio electronics, and accessories',
    alternates: { canonical: '/products' },
    robots: isFacetedQuery(query) ? { index: false, follow: true } : undefined,
  };
}
