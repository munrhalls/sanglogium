"use client";

import React, { useState } from 'react';
import { Checkbox } from '@/app/components/ui/Checkbox';
import {
  filterSectionHeaderAction,
  filterStateActive,
} from './FilterSidebar';

/**
 * Progressive-disclosure option list for a high-count checkbox facet (Brand and
 * similar). Implements the decisions in
 * `_project/filters/brand-facet-pattern.md`:
 *
 *  1. Show the first {@link INITIAL_VISIBLE} count-ranked options, then a
 *     "Show more (N)" control that reveals the rest inline; "Show less" snaps
 *     back to the same first slice.
 *  3. Render a search-within box only when the group has more than
 *     {@link SEARCH_THRESHOLD} options; it narrows by label substring, it does
 *     not re-sort.
 *  6. Any checked option is always hoisted into the visible set (above the
 *     count-ranked head, grouped as "selected") regardless of truncation or the
 *     search box. The "Show more" count counts only the still-hidden unselected
 *     remainder.
 *
 * This is a pure client-side view over the existing `options` prop — no query
 * or URL-param change. Scoped to the facets that opt in via
 * `CheckboxFilterGroup`'s `progressive` flag, not applied to every group.
 */

const INITIAL_VISIBLE = 8;
const SEARCH_THRESHOLD = 20;

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ProgressiveFilterOptionListProps {
  paramKey: string;
  label: string;
  options: FilterOption[];
  isFilterActive: (value: string) => boolean;
  toggle: (value: string) => void;
}

export function ProgressiveFilterOptionList({
  paramKey,
  label,
  options,
  isFilterActive,
  toggle,
}: ProgressiveFilterOptionListProps) {
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');

  const showSearch = options.length > SEARCH_THRESHOLD;
  const trimmed = query.trim().toLowerCase();
  const searching = showSearch && trimmed.length > 0;

  const selectedOptions = options.filter((option) => isFilterActive(option.value));
  const unselected = options.filter((option) => !isFilterActive(option.value));

  const matches = searching
    ? unselected.filter((option) => option.label.toLowerCase().includes(trimmed))
    : unselected;

  // Decision 1/6: truncate only the unselected remainder, and only when not searching.
  const visibleUnselected =
    showAll || searching ? matches : matches.slice(0, INITIAL_VISIBLE);
  const hiddenCount = matches.length - visibleUnselected.length;

  const renderCheckbox = (option: FilterOption) => (
    <Checkbox
      key={option.value}
      name={paramKey}
      value={option.value}
      label={option.label}
      count={option.count}
      checked={isFilterActive(option.value)}
      disabled={option.count === 0 && !isFilterActive(option.value)}
      onChange={() => toggle(option.value)}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {showSearch && (
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}`}
          aria-label={`Search ${label} options`}
          className="rounded-sm border border-border-primary bg-transparent px-2 py-1 type-caption text-text-primary placeholder:text-text-caption focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        />
      )}

      {selectedOptions.length > 0 && (
        <div
          className={`flex flex-col gap-2 ${
            visibleUnselected.length > 0 ? 'border-b border-border-secondary pb-2' : ''
          }`}
        >
          {selectedOptions.map(renderCheckbox)}
        </div>
      )}

      {visibleUnselected.map(renderCheckbox)}

      {searching && matches.length === 0 && (
        <span className="type-caption text-text-caption">No matches</span>
      )}

      {!searching && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className={`${filterSectionHeaderAction} ${filterStateActive} self-start hover:text-text-primary transition-colors`}
        >
          Show more ({hiddenCount})
        </button>
      )}

      {!searching && showAll && matches.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className={`${filterSectionHeaderAction} ${filterStateActive} self-start hover:text-text-primary transition-colors`}
        >
          Show less
        </button>
      )}
    </div>
  );
}
