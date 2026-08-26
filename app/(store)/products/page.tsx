import React from 'react';
import { getAllLeafKeys } from '@/data/catalogue';
import { getProductsByVfsKeys } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { getWishlistProductIds } from '@/lib/wishlist';
import { ShopHeader } from '@/app/components/features/products/ShopHeader';
import { EmptyResults } from '@/app/components/features/products/EmptyResults';
import { Pagination } from '@/app/components/features/products/Pagination';
import { ProductGrid } from '@/app/components/features/products/ProductGrid';
import { isFacetedQuery } from '@/lib/catalogue/seo';

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;
  const allKeys = getAllLeafKeys();

  const [{ products, totalCount }, wishlistProductIds] = await Promise.all([
    getProductsByVfsKeys({ keys: allKeys, page }),
    getWishlistProductIds(),
  ]);

  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-8 pb-12">
      <ShopHeader title="All Products" />

      {totalCount === 0 ? (
        <EmptyResults />
      ) : (
        <>
          <ProductGrid products={products} wishlistProductIds={wishlistProductIds} />
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalCount / 24)}
            totalCount={totalCount}
            perPage={24}
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
