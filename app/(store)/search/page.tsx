import React, { Suspense } from 'react';
import { SearchHeader } from '@/app/components/features/search/SearchHeader';
import { searchProductsFull } from '@/sanity-cms/lib/products/searchProducts';
import { ProductGridSkeleton } from '@/app/components/skeletons/ProductGridSkeleton';
import { isFacetedQuery } from '@/lib/catalogue/seo';
import { SearchResults } from './SearchResults';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const qValue = Array.isArray(query.q) ? query.q[0] : query.q;
  const q = typeof qValue === 'string' ? qValue : '';
  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;

  const resultsPromise = searchProductsFull(q, undefined, page);

  return (
    <div className="mx-auto max-w-content px-4 md:px-8 pt-6 pb-12">
      <SearchHeader query={q} />
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchResults resultsPromise={resultsPromise} query={q} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const q = typeof query.q === 'string' ? query.q.trim() : '';

  const baseMetadata = q
    ? {
        title: `${q} — Search Results | Sang Logium`,
        description: `Search results for "${q}" — headphones, IEMs, DACs and audio accessories at Sang Logium`,
      }
    : {
        title: 'Search — Sang Logium',
        description: 'Search for headphones, IEMs, DACs and audio accessories',
      };

  // Search-result permutations (?q=…?sort=…?page=…) are thin, transient content:
  // noindex them and point the canonical at the base /search page (G5).
  const hasSearchState = q.length > 0 || isFacetedQuery(query);
  if (hasSearchState) {
    return {
      ...baseMetadata,
      robots: { index: false, follow: true },
      alternates: { canonical: '/search' },
    };
  }

  return baseMetadata;
}
