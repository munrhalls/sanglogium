import React from 'react';
import { getAllLeafKeys } from '@/data/catalogue';
import { getProductsCount, getProductsChunk } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getFilterFacets } from '@/sanity-cms/lib/products/getFilterFacets';
import { getCategoryPriceRange } from '@/sanity-cms/lib/products/getCategoryPriceRange';
import { resolvePriceBounds } from '@/lib/catalogue/priceBounds';
import { getWishlistProductIds } from '@/lib/wishlist';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { ChunkedProductGrid, CHUNK_SIZE } from '@/app/components/features/products/ChunkedProductGrid';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { SortBar } from '@/app/components/features/filters/SortBar';
import { MobileFilterBar } from '@/app/components/features/filters/MobileFilterBar';
import { ActiveFilterChips } from '@/app/components/features/filters/ActiveFilterChips';
import { isFacetedQuery } from '@/lib/catalogue/seo';
import { loadFilterSort, SORT_DEFAULT } from '@/lib/catalogue/filterSortParams';
import { buildProductQuery } from '@/lib/catalogue/buildProductQuery';
import type { ProductQueryState } from '@/lib/catalogue/buildProductQuery';

export const dynamic = 'force-dynamic';

const PER_PAGE = 24;

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const allKeys = getAllLeafKeys();

  const state = loadFilterSort(query) as ProductQueryState;
  const { orderClause, whereClause, params } = buildProductQuery(state);
  const filtersActive = Object.entries(state).some(([key, value]) => {
    if (key === 'sort') return value !== SORT_DEFAULT;
    if (key === 'minPrice' || key === 'maxPrice') return value != null;
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  const [totalCount, allFacets, priceRange, wishlistProductIds] = await Promise.all([
    getProductsCount({ keys: allKeys, whereClause, params }),
    getFilterFacets({ keys: allKeys, state }),
    // FULL category price span — not narrowed by active filters, so the max
    // handle can always be dragged back up past the current selection.
    getCategoryPriceRange({ keys: allKeys }),
    getWishlistProductIds(),
  ]);
  const brandLabels = allFacets.brandLabels;
  const priceBounds = resolvePriceBounds(priceRange);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const effectivePage = totalPages > 0 ? Math.min(Math.max(1, page || 1), totalPages) : Math.max(1, page || 1);
  const pageStart = (effectivePage - 1) * PER_PAGE;

  const chunkPromises = Array.from(
    { length: Math.ceil(PER_PAGE / CHUNK_SIZE) },
    (_, i) => getProductsChunk({ keys: allKeys, offset: pageStart + i * CHUNK_SIZE, limit: CHUNK_SIZE, orderClause, whereClause, params }),
  );

  return (
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pb-12">
      <ShopHeader title="All Products" />

      {totalCount === 0 ? (
        <EmptyResults filtersActive={filtersActive} />
      ) : (
        <div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">
          <FilterSidebar facets={allFacets} priceBounds={priceBounds} />
          <div className="min-w-0 flex-1">
            <MobileFilterBar facets={allFacets} priceBounds={priceBounds} />
            <ActiveFilterChips brandLabels={brandLabels} />
            <SortBar totalCount={totalCount} />
            <ChunkedProductGrid chunkPromises={chunkPromises} wishlistProductIds={wishlistProductIds} />
            <Pagination
              currentPage={effectivePage}
              totalPages={totalPages}
              totalCount={totalCount}
              perPage={PER_PAGE}
            />
          </div>
        </div>
      )}
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
