'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPageList } from '@/lib/catalogue/pagination';

interface SearchPaginationProps {
  totalCount: number;
  perPage?: number;
}

/**
 * Real `<Link href>` pagination for search results (G8): crawlable, preserves
 * every query param (q, sort), supports middle-click/open-in-new-tab, and keeps
 * the previous scroll:false behavior via the Link `scroll` option. Visually
 * matches the catalogue's numbered `Pagination` component (app/components/
 * features/products/Pagination.tsx) instead of a plain Prev/Next pair.
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
  const pages = getPageList(currentPage, totalPages);

  const baseItem =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 type-metadata transition-colors';
  const inactive = 'border border-border-secondary text-secondary hover:bg-surface-elevated';
  const active = 'bg-secondary-900 text-white';
  const disabled = 'border border-border-secondary text-secondary-400 cursor-not-allowed';

  return (
    <nav
      aria-label="Search results pagination"
      className="mt-8 pt-6 border-t border-border-secondary flex flex-col items-center gap-3"
    >
      <span className="type-caption text-secondary-500" aria-live="polite">
        Showing {startItem}–{endItem} of {totalCount}
      </span>

      <div className="flex items-center justify-center gap-2">
        {currentPage > 1 ? (
          <Link href={hrefFor(currentPage - 1)} rel="prev" scroll={false} aria-label="Previous page" className={`${baseItem} ${inactive}`}>
            Prev
          </Link>
        ) : (
          <span aria-disabled="true" className={`${baseItem} ${disabled}`}>
            Prev
          </span>
        )}

        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="inline-flex h-10 min-w-10 items-center justify-center type-metadata text-secondary-400"
            >
              &hellip;
            </span>
          ) : page === currentPage ? (
            <span key={page} aria-current="page" className={`${baseItem} ${active}`}>
              {page}
            </span>
          ) : (
            <Link key={page} href={hrefFor(page)} scroll={false} aria-label={`Go to page ${page}`} className={`${baseItem} ${inactive}`}>
              {page}
            </Link>
          )
        )}

        {currentPage < totalPages ? (
          <Link href={hrefFor(currentPage + 1)} rel="next" scroll={false} aria-label="Next page" className={`${baseItem} ${inactive}`}>
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={`${baseItem} ${disabled}`}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
