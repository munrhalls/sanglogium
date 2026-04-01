import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';
import { getCategoryMetadata } from '@/sanity/lib/products/getCategoryMetadata';
import { getFiltersForCategoryPath } from '@/sanity/lib/products/filter/getFiltersForCategoryPath';
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
  const filters = Array.isArray(query.f) ? query.f : query.f ? [query.f] : [];

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
    <div className="container mx-auto px-4 pb-6 h-[calc(100vh-var(--desktop-header-h))]">
      <div className="flex gap-8 h-full overflow-hidden">
        {/* Sidebar - full height on left */}
        <aside className="hidden lg:block w-60 shrink-0 pt-6 h-full overflow-y-auto scrollbar-none">
          <Suspense fallback={<FilterSidebarSkeleton />}>
            <FilterSection filtersPromise={filtersPromise} />
          </Suspense>
        </aside>

        {/* Main content - header + products stacked */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-none">
          {/* Header now in right column */}
          <div className="pt-6 pb-4">
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
