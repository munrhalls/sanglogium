import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getCategoryMetadata } from '@/sanity-cms/lib/products/getCategoryMetadata';
import { getFiltersForCategoryPath, getValidFilterFields } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';
import { loadCategorySearchParams } from '@/lib/catalogue/searchParams';
import { stripUnknownFilters } from '@/lib/catalogue/filterUtils';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { CategoryPageClient } from './CategoryPageClient';
import { ProductsSection } from './ProductsSection';
import { FilterSection } from './FilterSection';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
import { FilterSidebarSkeleton } from '@/app/components/skeletons/FilterSidebarSkeleton';
import Breadcrumbs from '@/app/components/ui/breadcrumbs/CategoryBreadcrumbs';
import { isFacetedQuery, canonicalCategoryPath } from '@/lib/catalogue/seo';

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

  // Parse URL params via the shared, type-safe contract (single source of truth
  // for client + server). Multiple `?f=` params are normalized to the
  // comma-joined form the parser expects.
  const { sort, f: filters, page } = loadCategorySearchParams({
    ...query,
    f: Array.isArray(query.f) ? query.f.join(',') : query.f,
  });

  const descendantKeys = unrollDescendantKeys(nodeId);

  // Strip stale/unknown `?f=` fields BEFORE querying (G3) so SSR never flashes
  // an empty grid for shared/crawled URLs; the client effect stays as a backstop.
  const validFields = await getValidFilterFields(descendantKeys);
  const cleanedFilters = stripUnknownFilters(filters, validFields);

  // Create promises for streaming (don't await here)
  const productsPromise = getProductsByVfsKeys({
    keys: descendantKeys,
    sort,
    filters: cleanedFilters,
    page
  });
  const metadataPromise = getCategoryMetadata(nodeId);
  const filtersPromise = getFiltersForCategoryPath(descendantKeys, cleanedFilters);

  // Await metadata for immediate render (lightweight)
  const metadata = await metadataPromise;

  // Handle missing metadata (should not happen if nodeId exists, but type-safe)
  if (!metadata) {
    notFound();
  }

  // Build category path for overline (e.g., "Audio Electronics")
  // Only show overline on nested paths — parent category pages don't need a redundant heading
  const categoryPath = slug.length > 1
    ? slug[0].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : undefined;

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8 items-stretch">
        {/* Sidebar - full height on left */}
        <aside className="hidden lg-desktop:block lg-touch:block sticky top-[var(--desktop-header-h)] h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto scrollbar-none pt-6 self-start">
          <Suspense fallback={<FilterSidebarSkeleton />}>
            <FilterSection filtersPromise={filtersPromise} />
          </Suspense>
        </aside>

        {/* Main content - header + products stacked */}
        <main className="min-w-0 w-full pt-6">
          {/* Header now in right column */}
          <div className="pb-4">
            <Breadcrumbs categoryParts={slug} />
            <ShopHeader title={metadata.name} overline={categoryPath} />
          </div>

          {/* Products section */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductsSection
              productsPromise={productsPromise}
              filtersPromise={filtersPromise}
              categoryName={metadata.name}
              currentPage={page}
            />
          </Suspense>
        </main>
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
