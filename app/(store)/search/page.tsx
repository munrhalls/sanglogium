import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { searchProductsFull } from '@/sanity-cms/lib/products/searchProducts';
import { isFacetedQuery } from '@/lib/catalogue/seo';
import { detectSearchRedirect, SearchHeader } from '@/features/product-search';
import { loadFilterSort, type ProductQueryState } from '@/features/product-filtering';
import { SearchResults, SearchResultsSkeleton } from './SearchResults';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const qValue = Array.isArray(query.q) ? query.q[0] : query.q;
  const q = typeof qValue === 'string' ? qValue : '';

  const redirectUrl = detectSearchRedirect(q);
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  const pageValue = Array.isArray(query.page) ? query.page[0] : query.page;
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;

  const sortValue = Array.isArray(query.sort) ? query.sort[0] : query.sort;
  const sort = typeof sortValue === 'string' ? sortValue : undefined;

  // Same URL contract as the catalogue. `sort` is NOT taken from here: its
  // vocabulary has no `relevance`, so searchProductsFull validates the raw value.
  const filterState = loadFilterSort(query) as ProductQueryState;

  const catValue = Array.isArray(query.cat) ? query.cat[0] : query.cat;
  const category = typeof catValue === 'string' ? catValue : undefined;

  const resultsPromise = searchProductsFull(q, sort, page, undefined, filterState, category);

  return (
    // w-full: <main> is a flex column, so a bare mx-auto child shrinks to its
    // content's max-content width (the auto-fill grid then overflows past sm).
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 pt-4 sm:pt-6 pb-12">
      <SearchHeader query={q} />
      <Suspense fallback={<SearchResultsSkeleton />}>
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
