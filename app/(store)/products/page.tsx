import React from 'react';
import { getAllLeafKeys } from '@/features/catalogue/server';
import { getProductsCount, getProductsChunk } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getFilterFacets, getCategoryPriceRange } from '@/features/product-filtering/server';
import { getWishlistProductIds } from "@/features/products/server";
import { ShopHeader, EmptyResults, Pagination, ChunkedProductGrid, CHUNK_SIZE } from "@/features/products";
import { isFacetedQuery } from '@/features/catalogue';
import { ActiveFilterChips, FilterSidebar, SortBar, isFiltersActive, loadFilterSort, resolvePriceBounds, sanitizeFilterState, type ProductQueryState } from '@/features/product-filtering';

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

  // Drop URL filter values that match nothing valid for this route (e.g.
  // ?brand=notabrand, ?driverType=banana) so a junk deep link is inert instead
  // of a dead-end empty page. Closed-vocab facets are vetted purely up front;
  // brand is data-derived, so it is vetted below against the brand slugs the
  // facet computation finds on this route. (jw8.3)
  const preState = sanitizeFilterState(
    loadFilterSort(query) as ProductQueryState,
  );

  const [allFacets, priceRange, wishlistProductIds] = await Promise.all([
    getFilterFacets({ keys: allKeys, state: preState }),
    // FULL category price span — not narrowed by active filters, so the max
    // handle can always be dragged back up past the current selection.
    getCategoryPriceRange({ keys: allKeys }),
    getWishlistProductIds(),
  ]);
  const brandLabels = allFacets.brandLabels;

  const state = sanitizeFilterState(preState, { brand: Object.keys(brandLabels) });
  const filtersActive = isFiltersActive(state);

  const totalCount = await getProductsCount({ keys: allKeys, state });
  const priceBounds = resolvePriceBounds(priceRange);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const effectivePage = totalPages > 0 ? Math.min(Math.max(1, page || 1), totalPages) : Math.max(1, page || 1);
  const pageStart = (effectivePage - 1) * PER_PAGE;

  const chunkPromises = Array.from(
    { length: Math.ceil(PER_PAGE / CHUNK_SIZE) },
    (_, i) => getProductsChunk({ keys: allKeys, offset: pageStart + i * CHUNK_SIZE, limit: CHUNK_SIZE, state }),
  );

  return (
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pb-12">
      <ShopHeader title="All Products" />

      <div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">
        <FilterSidebar
          checkboxCounts={allFacets.groups}
          booleanCounts={allFacets.booleans}
          brandLabels={brandLabels}
          priceBounds={{ min: priceBounds.min, max: priceBounds.max }}
          isDefaultState={allFacets.isDefaultState}
        />
        <div className="min-w-0 flex-1">
          <ActiveFilterChips brandLabels={brandLabels} />
          <SortBar
            totalCount={totalCount}
            mobileFilterProps={{
              checkboxCounts: allFacets.groups,
              booleanCounts: allFacets.booleans,
              brandLabels,
              priceBounds: { min: priceBounds.min, max: priceBounds.max },
              isDefaultState: allFacets.isDefaultState,
            }}
          />
          {totalCount === 0 ? (
            <EmptyResults filtersActive={filtersActive} />
          ) : (
            <>
              <ChunkedProductGrid chunkPromises={chunkPromises} wishlistProductIds={wishlistProductIds} />
              <Pagination
                currentPage={effectivePage}
                totalPages={totalPages}
                totalCount={totalCount}
                perPage={PER_PAGE}
              />
            </>
          )}
        </div>
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
