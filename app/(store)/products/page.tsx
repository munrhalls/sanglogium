import React, { Suspense } from 'react';
import { getAllLeafKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getFiltersForCategoryPath, getValidFilterFields } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';
import { loadCategorySearchParams } from '@/lib/catalogue/searchParams';
import { stripUnknownFilters } from '@/lib/catalogue/filterUtils';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { FilterSection } from './[...slug]/FilterSection';
import { ProductsSection } from './[...slug]/ProductsSection';
import { FilterSidebarSkeleton } from '@/app/components/skeletons/FilterSidebarSkeleton';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
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

  const productsPromise = getProductsByVfsKeys({ keys: allKeys, sort, filters: cleanedFilters, page });
  const filtersPromise = getFiltersForCategoryPath(allKeys, cleanedFilters);

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
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductsSection
              productsPromise={productsPromise}
              filtersPromise={filtersPromise}
              categoryName="All Products"
              currentPage={page}
            />
          </Suspense>
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
    robots: isFacetedQuery(query) ? { index: false, follow: true } : undefined,
  };
}
