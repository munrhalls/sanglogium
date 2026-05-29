'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface SearchPaginationProps {
  totalCount: number;
  perPage?: number;
}

export function SearchPagination({ totalCount, perPage = 24 }: SearchPaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  // Don't render if everything fits on one page
  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    router.push(newUrl, { scroll: false });
  };

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalCount);

  return (
    <nav
      aria-label="Search results pagination"
      className="flex items-center justify-between border-t border-border-secondary pt-6 mt-8"
    >
      <span className="type-caption text-secondary-500">
        Showing {startItem}–{endItem} of {totalCount}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded-md border border-border-secondary type-caption text-primary transition-colors hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          Previous
        </button>

        <span className="type-caption text-secondary-500 px-2" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded-md border border-border-secondary type-caption text-primary transition-colors hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
