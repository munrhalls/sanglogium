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
      {/* No sidebar to eat width here, so cap the grid itself at max-w-content
          (1280px) — without it, auto-fill would run to 6-7 columns on wide
          screens. Lands at ~4 cols around 1280px, ~5 on wide. */}
      <ProductGrid
        products={products}
        className="max-w-content"
        wishlistProductIds={wishlistProductIds}
      />
      <SearchPagination totalCount={totalCount} />
    </>
  );
}
