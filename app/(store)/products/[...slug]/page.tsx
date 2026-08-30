import React from 'react';
import { notFound } from 'next/navigation';
import { resolveSlugToId, unrollDescendantKeys } from '@/data/catalogue';
import { getCategoryMetadata } from '@/sanity-cms/lib/products/getCategoryMetadata';
import { getProductsCount, getProductsChunk } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getWishlistProductIds } from '@/lib/wishlist';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { ChunkedProductGrid, CHUNK_SIZE } from '@/app/components/features/products/ChunkedProductGrid';
import { FilterSidebar } from '@/app/components/features/filters/FilterSidebar';
import { SortBar } from '@/app/components/features/filters/SortBar';
import Breadcrumbs from '@/app/components/ui/breadcrumbs/CategoryBreadcrumbs';
import { isFacetedQuery, canonicalCategoryPath } from '@/lib/catalogue/seo';

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

  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const descendantKeys = unrollDescendantKeys(nodeId);

  const [metadata, totalCount, wishlistProductIds] = await Promise.all([
    getCategoryMetadata(nodeId),
    getProductsCount({ keys: descendantKeys }),
    getWishlistProductIds(),
  ]);

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
    (_, i) => getProductsChunk({ keys: descendantKeys, offset: pageStart + i * CHUNK_SIZE, limit: CHUNK_SIZE }),
  );

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <Breadcrumbs categoryParts={slug} />
      <ShopHeader title={metadata.name} overline={categoryPath} />

      {totalCount === 0 ? (
        <EmptyResults />
      ) : (
        <div className="flex flex-col lg-touch:flex-row lg-desktop:flex-row gap-8">
          <FilterSidebar />
          <div className="min-w-0 flex-1">
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
