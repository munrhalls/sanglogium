import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getCategoryMetadata } from '@/sanity-cms/lib/products/getCategoryMetadata';
import { getProductsCount, PER_PAGE, ROW_SIZE } from '@/sanity-cms/lib/products/getProductsSlice';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { StreamedProductGrid } from './StreamedProductGrid';
import { ProductGridURLSync } from './ProductGridURLSync';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { SortAndCountBar } from './SortAndCountBar';
import Breadcrumbs from '@/app/components/ui/breadcrumbs/CategoryBreadcrumbs';
import { isFacetedQuery, canonicalCategoryPath } from '@/lib/catalogue/seo';
import { SORT_DEFAULT, parseFilterParam } from '@/lib/catalogue/sortParams';

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

  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const descendantKeys = unrollDescendantKeys(nodeId);

  // Product Grid actor: this page never guesses at sort/filter state — it
  // reads exactly what the URL says (query.sort / query.f) and nothing else.
  const sortValue = Array.isArray(query.sort) ? query.sort[0] : query.sort;
  const sort = sortValue ?? SORT_DEFAULT;
  const filters = parseFilterParam(query.f);

  const metadata = await getCategoryMetadata(nodeId);

  if (!metadata) {
    notFound();
  }

  const totalCount = await getProductsCount({ keys: descendantKeys, filters });
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / PER_PAGE) : 0;
  const effectivePage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : Math.max(1, page);
  const isPageOutOfRange = totalPages > 0 && page > totalPages;
  const pageStart = (effectivePage - 1) * PER_PAGE;
  const rowCount = totalCount === 0 ? 0 : Math.ceil(Math.min(PER_PAGE, totalCount - pageStart) / ROW_SIZE);
  // Suspense boundary keys must change whenever sort/filters change too, not
  // just page — otherwise React would keep stale per-row results mounted
  // across a sort/filter change instead of re-suspending for new data.
  const filterKey = `${effectivePage}:${sort}:${filters.join('|')}`;

  const categoryPath = slug.length > 1
    ? slug[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : undefined;

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12 grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8">
      <FilterSidebar />
      <main className="min-w-0 w-full pt-6">
        <div className="pb-4">
          <Breadcrumbs categoryParts={slug} />
          <ShopHeader title={metadata.name} overline={categoryPath} />
        </div>

        <SortAndCountBar />

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
              keys={descendantKeys}
              sort={sort}
              filters={filters}
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
      <ProductGridURLSync />
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
