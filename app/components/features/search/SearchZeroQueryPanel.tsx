"use client";

import React, { useEffect, useState } from 'react';
import { MagnifyingGlass, Clock, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils/tailwind';
import { getRecentSearches, clearRecentSearches } from './recentSearches';

/**
 * Zero-query state for the mobile search overlay (sang-logium-85y).
 * Shows recent searches (localStorage, up to 6) above a fixed Popular list.
 * Tapping a row calls onSelect with the term — the parent reuses its existing
 * router.push('/search?q=...') path. No fetch, no new search behaviour here.
 */

const POPULAR_SEARCHES = [
  'Headphones',
  'IEMs',
  'DACs & Amps',
  'Cables',
  'Accessories',
  'Sennheiser',
  'FiiO',
] as const;

interface SearchZeroQueryPanelProps {
  onSelect: (term: string) => void;
}

const rowClass = cn(
  'flex items-center gap-3 w-full min-h-[44px] px-3 py-2',
  'text-left type-body text-primary',
  'hover:bg-surface-card active:bg-surface-card transition-colors duration-150 rounded-md'
);

export function SearchZeroQueryPanel({ onSelect }: SearchZeroQueryPanelProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  const handleClear = () => {
    clearRecentSearches();
    setRecent([]);
  };

  return (
    <div
      className={cn(
        'w-full mt-2',
        'bg-surface-elevated border border-border-secondary rounded-lg shadow-cardDark',
        'overflow-y-auto'
      )}
    >
      {recent.length > 0 && (
        <section className="py-1">
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span className="type-overline text-accent-500">Recent</span>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 type-caption text-secondary hover:text-primary transition-colors min-h-[44px] -my-2 px-1"
              aria-label="Clear recent searches"
            >
              <X size={12} />
              Clear
            </button>
          </div>
          <ul>
            {recent.map((term) => (
              <li key={term}>
                <button type="button" className={rowClass} onClick={() => onSelect(term)}>
                  <Clock size={16} className="shrink-0 text-secondary-600" />
                  <span className="truncate">{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={cn('py-1', recent.length > 0 && 'border-t border-border-secondary')}>
        <div className="px-3 pt-3 pb-1">
          <span className="type-overline text-accent-500">Popular</span>
        </div>
        <ul className="pb-2">
          {POPULAR_SEARCHES.map((term) => (
            <li key={term}>
              <button type="button" className={rowClass} onClick={() => onSelect(term)}>
                <MagnifyingGlass size={16} className="shrink-0 text-secondary-600" />
                <span className="truncate">{term}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
