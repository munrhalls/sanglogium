import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getCategoryMetadata } from '@/sanity-cms/lib/products/getCategoryMetadata';
import { getFiltersForCategoryPath } from '@/sanity-cms/lib/products/filter/getFiltersForCategoryPath';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { CategoryPageClient } from './CategoryPageClient';
import { ProductsSection } from './ProductsSection';
import { FilterSection } from './FilterSection';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
import { FilterSidebarSkeleton } from '@/app/components/skeletons/FilterSidebarSkeleton';
import Breadcrumbs from '@/app/components/ui/breadcrumbs/CategoryBreadcrumbs';

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

  // Parse URL params
  const sort = typeof query.sort === 'string' ? query.sort : 'featured';
  const rawFilters = Array.isArray(query.f) ? query.f : query.f ? [query.f] : [];

  // Handle comma-separated filters: "brand:Hifiman,brand:Focal" -> ["brand:Hifiman", "brand:Focal"]
  const filters = rawFilters.flatMap(f => f.split(','));

  const descendantKeys = unrollDescendantKeys(nodeId);

  // Create promises for streaming (don't await here)
  const productsPromise = getProductsByVfsKeys({
    keys: descendantKeys,
    sort,
    filters
  });
  const metadataPromise = getCategoryMetadata(nodeId);
  const filtersPromise = getFiltersForCategoryPath(descendantKeys);

  // Await metadata for immediate render (lightweight)
  const metadata = await metadataPromise;

  // Handle missing metadata (should not happen if nodeId exists, but type-safe)
  if (!metadata) {
    notFound();
  }

  // Build category path for overline (e.g., "Audio Electronics")
  const categoryPath = slug[0]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <div className="grid grid-cols-1 lg-desktop:grid-cols-[240px_minmax(0,1fr)] lg-touch:grid-cols-[240px_minmax(0,1fr)] gap-8 items-stretch">
        {/* Sidebar - full height on left */}
        <aside className="hidden lg-desktop:block lg-touch:block sticky top-[var(--desktop-header-h)] h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto scrollbar-none pt-6">
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
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
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
  };
}
