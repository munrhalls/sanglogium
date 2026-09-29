import React from 'react';
import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { CATEGORY_SUGGESTIONS, POPULAR_SEARCHES, searchHref } from './searchLinks';

interface SearchEmptyProps {
  query: string;
}

const chip =
  'inline-flex min-h-11 items-center rounded-md border border-border-secondary px-4 type-body text-primary transition-colors hover:bg-surface-card active:bg-surface-card';

/**
 * Shown when a search has no products, and when /search is opened without a
 * query. Either way it is a starting point, never a dead end: real category and
 * popular-search links, all server-rendered anchors with 44px targets.
 */
export function SearchEmpty({ query }: SearchEmptyProps) {
  const hasQuery = query.length > 0;

  return (
    <div className="flex flex-col items-center py-10 text-center sm:py-16 lg-touch:py-8">
      <MagnifyingGlass size={40} className="mb-4 text-secondary-500" aria-hidden="true" />
      <h2 className="type-h3 mb-2 text-primary">
        {hasQuery ? 'No products found' : 'What are you looking for?'}
      </h2>
      <p className="type-body mb-8 max-w-prose text-secondary">
        {hasQuery
          ? `We couldn’t find anything matching “${query}”. Check the spelling or try a broader term.`
          : 'Search by product, brand or type, or start from a category below.'}
      </p>

      <div className="section-header-anchor mb-4">
        <p className="type-overline text-accent-500">{hasQuery ? 'Try instead' : 'Browse'}</p>
      </div>
      <ul className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {CATEGORY_SUGGESTIONS.map((cat) => (
          <li key={cat.href}>
            <Link href={cat.href} className={chip}>
              {cat.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="section-header-anchor mb-4">
        <p className="type-overline text-accent-500">Popular searches</p>
      </div>
      <ul className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {POPULAR_SEARCHES.map((term) => (
          <li key={term}>
            <Link href={searchHref(term)} className={chip}>
              {term}
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/products" className="btn-ghost inline-flex min-h-11 items-center">
        Browse all products &rarr;
      </Link>
    </div>
  );
}
