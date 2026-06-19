"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPageList } from '@/lib/catalogue/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Numbered pagination for the catalogue. Renders real `<Link>` hrefs (SEO- and
 * crawl-friendly) that preserve every other query param (sort, filters) and
 * only mutate `?page=`. Navigation triggers a normal server re-render, so the
 * product window updates without client state.
 */
export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const hrefFor = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const pages = getPageList(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const baseItem =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 type-metadata transition-colors';
  const inactive = 'border border-border-secondary text-secondary hover:bg-secondary-100';
  const active = 'bg-secondary-900 text-white';
  const disabled = 'border border-border-secondary text-secondary-400 cursor-not-allowed';

  return (
    <nav
      aria-label="Pagination"
      data-testid="pagination"
      className="mt-8 flex items-center justify-center gap-2"
    >
      {hasPrev ? (
        <Link href={hrefFor(currentPage - 1)} rel="prev" aria-label="Previous page" className={`${baseItem} ${inactive}`}>
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
          <span
            key={page}
            aria-current="page"
            className={`${baseItem} ${active}`}
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-label={`Go to page ${page}`}
            className={`${baseItem} ${inactive}`}
          >
            {page}
          </Link>
        )
      )}

      {hasNext ? (
        <Link href={hrefFor(currentPage + 1)} rel="next" aria-label="Next page" className={`${baseItem} ${inactive}`}>
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={`${baseItem} ${disabled}`}>
          Next
        </span>
      )}
    </nav>
  );
}
