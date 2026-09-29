"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useSearchOverlay } from '@/app/hooks/nuqs/useSearchOverlay';

interface SearchQueryBarProps {
  query: string;
}

export function SearchQueryBar({ query }: SearchQueryBarProps) {
  const router = useRouter();
  const { openSearch } = useSearchOverlay();

  return (
    <div
      className="sm:hidden flex items-center px-3 h-11 w-full mb-4 bg-secondary-300"
      style={{ borderRadius: '3px' }}
    >
      <button
        type="button"
        onClick={openSearch}
        className="flex items-center gap-3 flex-1 min-w-0 h-11 text-left"
        aria-label={`Edit search: ${query}`}
      >
        <MagnifyingGlass size={16} className="shrink-0 text-secondary-600" />
        <span className="truncate type-body text-brand-700">{query}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          router.push('/search');
        }}
        className="flex items-center justify-center w-11 h-11 -mr-2 shrink-0 text-secondary-500 hover:text-primary transition-colors"
        aria-label="Clear search"
      >
        <X size={16} />
      </button>
    </div>
  );
}
