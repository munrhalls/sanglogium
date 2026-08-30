import React from 'react';
import { SearchEmpty } from '@/app/components/features/search/SearchEmpty';
import { SearchPagination } from '@/app/components/features/search/SearchPagination';
import { ProductGrid } from '@/app/components/features/products/ProductGrid';
import { getWishlistProductIds } from '@/lib/wishlist';
import type { SearchResult } from '@/sanity-cms/lib/products/searchProducts';

interface SearchResultsProps {
  resultsPromise: Promise<SearchResult>;
  query: string;
}

export async function SearchResults({ resultsPromise, query }: SearchResultsProps) {
  const { products, totalCount } = await resultsPromise;
  const wishlistProductIds = await getWishlistProductIds();

  if (products.length === 0) {
    return <SearchEmpty query={query} />;
  }

  return (
    <>
      <div className="border-b border-border-secondary pb-4 mb-6">
        <span className="type-metadata text-secondary">{totalCount} products</span>
      </div>
      {/* No sidebar here, so the shared auto-fill grid gets the full
          max-w-catalogue width and lands at ~4 columns at 1280px, 5 on wide. */}
      <ProductGrid
        products={products}
        wishlistProductIds={wishlistProductIds}
      />
      <SearchPagination totalCount={totalCount} />
    </>
  );
}
