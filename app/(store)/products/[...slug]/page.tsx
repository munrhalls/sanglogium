import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity/lib/products/getProductsByVfsKeys';
import { getCategoryMetadata } from '@/sanity/lib/products/getCategoryMetadata';
import { getFiltersForCategoryPath } from '@/sanity/lib/products/filter/getFiltersForCategoryPath';
import { ShopLayout } from '@/app/components/features/shop/ShopLayout';
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

  // Build category path for overline (e.g., "HEADPHONES · OPEN-BACK")
  const categoryPath = slug
    .map(part => part.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
    .join(' · ');

  return (
    <>
      {/* Full-width header - static, renders immediately */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <Breadcrumbs categoryParts={slug} />
        <ShopHeader title={metadata.name} overline={categoryPath} />
      </div>

      {/* Sidebar + content with Suspense boundaries */}
      <ShopLayout
        sidebar={
          <Suspense fallback={<FilterSidebarSkeleton />}>
            <FilterSection filtersPromise={filtersPromise} />
          </Suspense>
        }
      >
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductsSection
            productsPromise={productsPromise}
            filtersPromise={filtersPromise}
            categoryName={metadata.name}
          />
        </Suspense>
      </ShopLayout>
    </>
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
