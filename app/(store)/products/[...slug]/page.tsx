import React from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getCategoryMetadata } from '@/sanity-cms/lib/products/getCategoryMetadata';
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
import { ActiveFilterChips } from '@/app/components/features/filters/ActiveFilterChips';
import { isCategory, type Category } from '@/app/components/features/filters/category';
import Breadcrumbs from '@/app/components/ui/breadcrumbs/CategoryBreadcrumbs';
import { isFacetedQuery, canonicalCategoryPath } from '@/lib/catalogue/seo';
import { loadFilterSort } from '@/lib/catalogue/filterSortParams';
import { buildProductQuery, isFiltersActive } from '@/lib/catalogue/buildProductQuery';
import type { ProductQueryState } from '@/lib/catalogue/buildProductQuery';
import { sanitizeFilterState } from '@/lib/catalogue/sanitizeFilterState';

export const dynamic = 'force-dynamic';

const PER_PAGE = 24;

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    notFound();
  }

  // slug[0] is always the top-level category (headphones/audio-electronics/
  // accessories), including for nested category pages -- picks which of the
  // three per-category facet modules drives the sidebar (sang-logium-3rv.6).
  // isCategory's type guard only narrows a plain variable, not an indexed
  // expression like slug[0] directly -- bind it first or the ternary widens
  // back to `string` and fails FilterSidebarProps.category's `Category` type.
  const rawCategory = slug[0];
  const category: Category = isCategory(rawCategory) ? rawCategory : 'headphones';

  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const descendantKeys = unrollDescendantKeys(nodeId);

  // Drop URL filter values that match nothing valid for this route (e.g.
  // ?brand=notabrand, ?driverType=banana) so a junk deep link is inert instead
  // of a dead-end empty page. Closed-vocab facets are vetted purely up front;
  // brand is data-derived, so it is vetted below against the brand slugs the
  // facet computation finds on this route. (jw8.3)
  const preState = sanitizeFilterState(
    loadFilterSort(query) as ProductQueryState,
  );

  const [metadata, facets, priceRange, wishlistProductIds] = await Promise.all([
    getCategoryMetadata(nodeId),
    getFilterFacets({ keys: descendantKeys, state: preState }),
    // FULL category price span — not narrowed by active filters, so the max
    // handle can always be dragged back up past the current selection.
    getCategoryPriceRange({ keys: descendantKeys }),
    getWishlistProductIds(),
  ]);

  const state = sanitizeFilterState(preState, {
    brand: Object.keys(facets.brandLabels),
  });
  const { orderClause, whereClause, params: queryParams } = buildProductQuery(state);

  const filtersActive = isFiltersActive(state);

  const totalCount = await getProductsCount({ keys: descendantKeys, whereClause, params: queryParams });
  const priceBounds = resolvePriceBounds(priceRange);

  if (!metadata) {
    notFound();
  }

  const categoryPath = slug.length > 1
    ? slug[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : undefined;

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const effectivePage = totalPages > 0 ? Math.min(Math.max(1, page || 1), totalPages) : Math.max(1, page || 1);
  const pageStart = (effectivePage - 1) * PER_PAGE;

  // Fire one chunk fetch per CHUNK_SIZE slice of the page, in parallel and
  // unawaited — each is streamed in independently via ChunkedProductGrid's
  // own Suspense boundaries.
  const chunkPromises = Array.from(
    { length: Math.ceil(PER_PAGE / CHUNK_SIZE) },
    (_, i) => getProductsChunk({ keys: descendantKeys, offset: pageStart + i * CHUNK_SIZE, limit: CHUNK_SIZE, orderClause, whereClause, params: queryParams }),
  );

  return (
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pb-12">
      <Breadcrumbs categoryParts={slug} />
      <ShopHeader title={metadata.name} overline={categoryPath} />

      <div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">
        <FilterSidebar
          key={category}
          category={category}
          checkboxCounts={facets.groups}
          booleanCounts={facets.booleans}
          brandLabels={facets.brandLabels}
          priceBounds={{ min: priceBounds.min, max: priceBounds.max }}
          rangeBounds={facets.ranges}
        />
        <div className="min-w-0 flex-1">
          <ActiveFilterChips key={category} category={category} brandLabels={facets.brandLabels} />
          <SortBar totalCount={totalCount} category={category} />
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

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const leafSlug = slug[slug.length - 1];
  const nodeId = resolveSlugToId(leafSlug);

  if (!nodeId) {
    return { title: 'Category Not Found' };
  }

  const metadata = await getCategoryMetadata(nodeId);

  if (!metadata) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${metadata.name} — Sang Logium`,
    description: `Browse ${metadata.name} headphones and audio equipment`,
    alternates: { canonical: canonicalCategoryPath(slug) },
    robots: isFacetedQuery(query) ? { index: false, follow: true } : undefined,
  };
}
