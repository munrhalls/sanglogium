import React from 'react';
import { SearchEmpty } from '@/app/components/features/search/SearchEmpty';
import { ProductGrid } from '@/app/components/features/products/ProductGrid';
import { SortDropdown } from '@/app/components/features/filters/SortDropdown';
import type { SearchProduct } from '@/sanity-config/lib/products/searchProducts';

interface SearchResultsProps {
  productsPromise: Promise<SearchProduct[]>;
  query: string;
}

export async function SearchResults({ productsPromise, query }: SearchResultsProps) {
  const products = await productsPromise;

  if (products.length === 0) {
    return <SearchEmpty query={query} />;
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border-secondary pb-4 mb-6">
        <SortDropdown />
        <span className="type-metadata text-secondary">{products.length} products</span>
      </div>
      <ProductGrid
        products={products}
        className="grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg-desktop:grid-cols-4 lg-touch:grid-cols-3"
      />
    </>
  );
}
