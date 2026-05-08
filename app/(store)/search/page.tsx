import React, { Suspense } from 'react';
import { SearchHeader } from '@/app/components/features/search/SearchHeader';
import { searchProductsFull } from '@/sanity-cms/lib/products/searchProducts';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
import { SearchResults } from './SearchResults';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q : '';
  const sort = typeof query.sort === 'string' ? query.sort : undefined;

  const productsPromise = searchProductsFull(q, sort);

  return (
    <div className="mx-auto max-w-content px-4 md:px-8 pt-6 pb-12">
      <SearchHeader query={q} />
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchResults productsPromise={productsPromise} query={q} />
      </Suspense>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: 'Search — Sang Logium',
    description: 'Search for headphones, IEMs, DACs and audio accessories',
  };
}
