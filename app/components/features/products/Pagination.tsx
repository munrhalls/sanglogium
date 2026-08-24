"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPageList } from '@/lib/catalogue/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage?: number;
}

/**
 * Numbered pagination for the catalogue. Renders real `<Link>` hrefs (SEO- and
 * crawl-friendly) that preserve every other query param (sort, filters) and
 * only mutate `?page=`. Navigation triggers a normal server re-render, so the
 * product window updates without client state. Also shows a positional
 * 'Showing X–Y of Z' line matching the search surface (G7).
 */
export const PAGINATION_WRAPPER_CLASSES = 'mt-8 flex flex-col items-center gap-3';
export const PAGINATION_CAPTION_CLASSES = 'type-caption text-secondary-500';
export const PAGINATION_BUTTON_ROW_CLASSES = 'h-10';

export function PaginationSkeleton() {
  return (
    <nav
      aria-label="Pagination"
      aria-hidden="true"
      data-testid="pagination-skeleton"
      className={PAGINATION_WRAPPER_CLASSES}
    >
      <span className={`${PAGINATION_CAPTION_CLASSES} bg-secondary-800 rounded w-40 animate-pulse inline-block`}>
        &nbsp;
      </span>
      <div className={`${PAGINATION_BUTTON_ROW_CLASSES} animate-pulse`} />
    </nav>
  );
}

export function Pagination({ currentPage, totalPages, totalCount, perPage = 24 }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startItemFallback = totalCount === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItemFallback = Math.min(currentPage * perPage, totalCount);

  if (totalPages <= 1) {
    return (
      <nav
        aria-label="Pagination"
        aria-hidden="true"
        data-testid="pagination"
        className={PAGINATION_WRAPPER_CLASSES}
      >
        <span className={PAGINATION_CAPTION_CLASSES} aria-live="polite">
          Showing {startItemFallback}–{endItemFallback} of {totalCount}
        </span>
        <div className={PAGINATION_BUTTON_ROW_CLASSES} />
      </nav>
    );
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

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalCount);

  const baseItem =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 type-metadata transition-colors';
  const inactive = 'border border-border-secondary text-secondary hover:bg-secondary-100';
  const active = 'bg-secondary-900 text-white';
  const disabled = 'border border-border-secondary text-secondary-400 cursor-not-allowed';

  return (
    <nav
      aria-label="Pagination"
      data-testid="pagination"
      className="mt-8 flex flex-col items-center gap-3"
    >
      <span className="type-caption text-secondary-500" aria-live="polite">
        Showing {startItem}–{endItem} of {totalCount}
      </span>

      <div className="flex items-center justify-center gap-2">
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
      </div>
    </nav>
  );
}
