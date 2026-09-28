import React from 'react';
import Link from 'next/link';

interface SearchHeaderProps {
  query: string;
}

/**
 * Results heading. Phones drop the breadcrumb (the header bar and system Back
 * already cover it) and use a smaller heading so the first products show above
 * the fold; sm and up keep the breadcrumb and the editorial heading.
 */
export function SearchHeader({ query }: SearchHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <nav aria-label="Breadcrumb" className="mb-6 hidden sm:block">
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
            <span className="type-caption text-caption select-none" aria-hidden="true">
              /
            </span>
          </li>
          <li>
            <span className="type-caption text-primary font-medium" aria-current="page">
              Search
            </span>
          </li>
        </ol>
      </nav>
      <div className="section-header-anchor">
        <p className="type-overline text-accent-500">Search Results</p>
      </div>
      <h1 className="type-section-hed mt-1 break-words uppercase text-h3 sm:mt-2 sm:text-h1">
        {query ? `“${query.toUpperCase()}”` : 'Search'}
      </h1>
    </div>
  );
}
