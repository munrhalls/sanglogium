'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface SearchPaginationProps {
  totalCount: number;
  perPage?: number;
}

/**
 * Real `<Link href>` pagination for search results (G8): crawlable, preserves
 * every query param (q, sort), supports middle-click/open-in-new-tab, and keeps
 * the previous scroll:false behavior via the Link `scroll` option.
 */
export function SearchPagination({ totalCount, perPage = 24 }: SearchPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  // Don't render if everything fits on one page
  if (totalPages <= 1) return null;

  const hrefFor = (page: number): string => {
    if (page < 1 || page > totalPages) return '';
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalCount);

  const activeItem =
    'px-3 py-2 rounded-md border border-border-secondary type-caption text-primary transition-colors hover:bg-surface-elevated';
  const disabledItem =
    'px-3 py-2 rounded-md border border-border-secondary type-caption text-secondary-400 cursor-not-allowed';

  return (
    <nav
      aria-label="Search results pagination"
      className="flex items-center justify-between border-t border-border-secondary pt-6 mt-8"
    >
      <span className="type-caption text-secondary-500">
        Showing {startItem}–{endItem} of {totalCount}
      </span>

      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={hrefFor(currentPage - 1)}
            rel="prev"
            scroll={false}
            aria-label="Previous page"
            className={activeItem}
          >
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledItem}>
            Previous
          </span>
        )}

        <span className="type-caption text-secondary-500 px-2" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={hrefFor(currentPage + 1)}
            rel="next"
            scroll={false}
            aria-label="Next page"
            className={activeItem}
          >
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledItem}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
