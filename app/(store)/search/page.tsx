import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSearchPage, getSearchMetadata, SearchResultsView } from '@/features/product-search/server';
import { SearchResultsSkeleton } from '@/features/product-search';
import { SearchHeader } from '@/features/product-search';
import { getWishlistProductIds, WishlistToggleView } from '@/features/wishlist/server';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const search = getSearchPage(await searchParams);
  if (search.kind === 'redirect') {
    redirect(search.to);
  }
  const wishlist = getWishlistProductIds();

  return (
    // w-full: <main> is a flex column, so a bare mx-auto child shrinks to its
    // content's max-content width (the auto-fill grid then overflows past sm).
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pt-4 sm:pt-6 pb-12">
      <SearchHeader query={search.query} />
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResultsView
          resultsPromise={search.resultsPromise}
          cardAction={(productId, className) => (
            <WishlistToggleView productId={productId} wishlistPromise={wishlist} variant="quiet" className={className} />
          )}
          query={search.query}
        />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  return getSearchMetadata(await searchParams);
}
