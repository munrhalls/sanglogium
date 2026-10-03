'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPageList } from '@/features/catalogue';

interface SearchPaginationProps {
  totalCount: number;
  perPage?: number;
}

/**
 * Real `<Link href>` pagination for search results (G8): crawlable, preserves
 * every query param (q, sort), supports middle-click/open-in-new-tab, and keeps
 * the default Link scroll behavior, so a page change returns to the top.
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

  // 44px-tall targets; on phones the two buttons share the row equally so each
  // is a wide, thumb-friendly target instead of a small chip.
  const item =
    'inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-border-secondary px-4 type-body sm:flex-none';
  const activeItem = `${item} text-primary transition-colors hover:bg-surface-elevated active:bg-surface-elevated`;
  const disabledItem = `${item} text-secondary-400 cursor-not-allowed`;
  // Numbered pills (matches features/products/ui/Pagination.tsx)
  // only from sm up, where there's room for them next to Prev/Next. A phone-
  // width strip of number pills is a worse tap target than the existing wide
  // Prev/Next pair, so phones keep the plain "Page X of Y" caption instead.
  const numberBase =
    'hidden min-h-11 min-w-11 items-center justify-center rounded-md px-3 type-body transition-colors sm:inline-flex';
  const numberInactive = `${numberBase} border border-border-secondary text-secondary hover:bg-surface-elevated`;
  const numberActive = `${numberBase} bg-secondary-900 text-white`;

  return (
    <nav
      aria-label="Search results pagination"
      className="mt-8 flex flex-col gap-3 border-t border-border-secondary pt-6 sm:items-center xl:flex-row xl:justify-between"
    >
      <span className="type-caption text-secondary-500">
        Showing {startItem}–{endItem} of {totalCount}
      </span>

      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={hrefFor(currentPage - 1)}
            rel="prev"
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

        <span className="type-caption shrink-0 px-2 text-secondary-500 sm:hidden" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>
        <span className="hidden items-center gap-2 sm:flex">
          {pages.map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="inline-flex min-w-11 items-center justify-center type-body text-secondary-400"
              >
                &hellip;
              </span>
            ) : page === currentPage ? (
              <span key={page} aria-current="page" className={numberActive}>
                {page}
              </span>
            ) : (
              <Link key={page} href={hrefFor(page)} aria-label={`Go to page ${page}`} className={numberInactive}>
                {page}
              </Link>
            )
          )}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={hrefFor(currentPage + 1)}
            rel="next"
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
