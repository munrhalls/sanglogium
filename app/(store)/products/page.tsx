import React from 'react';
import { notFound } from 'next/navigation';
import { getListingPage, getListingMetadata, ListingView } from '@/features/products/server';
import { getWishlistProductIds, WishlistToggleView } from '@/features/wishlist/server';

export const dynamic = 'force-dynamic';

interface AllProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  const wishlist = getWishlistProductIds();
  const result = await getListingPage({ slug: null, query });
  if (result.notFound) notFound();

  return (
    <ListingView
      {...result}
      cardAction={(productId, className) => (
        <WishlistToggleView productId={productId} wishlistPromise={wishlist} variant="quiet" className={className} />
      )}
    />
  );
}

export async function generateMetadata({ searchParams }: AllProductsPageProps) {
  const query = await searchParams;
  return getListingMetadata({ slug: null, query });
}
