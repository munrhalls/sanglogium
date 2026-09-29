import React from 'react';
import Link from 'next/link';
import { SearchQueryBar } from './SearchQueryBar';

interface SearchHeaderProps {
  query: string;
}

export function SearchHeader({ query }: SearchHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      {query && <SearchQueryBar query={query} />}
      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/"
              className="type-caption text-secondary hover:text-primary transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <span className="type-caption text-caption select-none">/</span>
          </li>
          <li>
            <span className="type-caption text-primary font-medium">Search</span>
          </li>
        </ol>
      </nav>
      <div className="section-header-anchor">
        <p className="type-overline text-accent-500">Search Results</p>
      </div>
      <h1 className="type-section-hed uppercase mt-2 break-words line-clamp-2 text-spotlight sm:text-h1">
        {query ? `\u201C${query.toUpperCase()}\u201D` : 'Search'}
      </h1>
    </div>
  );
}
