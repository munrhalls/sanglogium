import React, { Suspense } from 'react';
import { getAllLeafKeys } from '@/data/catalogue';
import { getProductsCount, PER_PAGE, ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { StreamedProductGrid } from './[...slug]/StreamedProductGrid';
import { isFacetedQuery } from '@/lib/catalogue/seo';

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const allKeys = getAllLeafKeys();

  const totalCount = await getProductsCount({ keys: allKeys });
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PER_PAGE) : 0;
  const effectivePage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : Math.max(1, page);
  const isPageOutOfRange = totalPages > 0 && page > totalPages;
  const pageStart = (effectivePage - 1) * PER_PAGE;
  const rowCount = totalCount === 0 ? 0 : Math.ceil(Math.min(PER_PAGE, totalCount - pageStart) / ROW_SIZE);
  const filterKey = String(effectivePage);

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <main className="min-w-0 w-full pt-6">
        <div className="pb-4">
          <ShopHeader title="All Products" />
        </div>
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
              sort=""
              filters={[]}
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
