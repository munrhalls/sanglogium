import React from 'react';
import { notFound } from 'next/navigation';
import { getListingPage, getListingMetadata, ListingView } from '@/features/products/server';
import { WishlistToggle } from '@/features/wishlist';

// Next reads this as a literal. It must equal FACET_REVALIDATE_SECONDS in
// features/product-filtering/adapters/sanity/catalogueCache.ts. dynamicParams stays at its default (true),
// so leaf alias URLs that resolve today are rendered on first request.
export const revalidate = 300;

// The base listing only: any request with a query string is rewritten to /products-faceted by middleware.
export default async function AllProductsPage() {
  const result = await getListingPage({ slug: null, query: {} });
  if (result.notFound) notFound();

  return <ListingView {...result} cardAction={(productId, className) => <WishlistToggle productId={productId} variant="quiet" className={className} />} />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return getListingMetadata({ slug: null, query: {} });
}
