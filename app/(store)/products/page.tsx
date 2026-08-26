import React from 'react';
import { getAllLeafKeys } from '@/data/catalogue';
import { getProductsCount, getProductsChunk } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getWishlistProductIds } from '@/lib/wishlist';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { ChunkedProductGrid, CHUNK_SIZE } from '@/app/components/features/products/ChunkedProductGrid';
import { isFacetedQuery } from '@/lib/catalogue/seo';

const PER_PAGE = 24;

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const allKeys = getAllLeafKeys();

  const [totalCount, wishlistProductIds] = await Promise.all([
    getProductsCount({ keys: allKeys }),
    getWishlistProductIds(),
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const effectivePage = totalPages > 0 ? Math.min(Math.max(1, page || 1), totalPages) : Math.max(1, page || 1);
  const pageStart = (effectivePage - 1) * PER_PAGE;

  const chunkPromises = Array.from(
    { length: Math.ceil(PER_PAGE / CHUNK_SIZE) },
    (_, i) => getProductsChunk({ keys: allKeys, offset: pageStart + i * CHUNK_SIZE, limit: CHUNK_SIZE }),
  );

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <ShopHeader title="All Products" />

      {totalCount === 0 ? (
        <EmptyResults />
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
