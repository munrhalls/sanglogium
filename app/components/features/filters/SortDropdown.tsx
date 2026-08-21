import React from 'react';
import { filterControlState } from './PriceRangeSlider';

/**
 * Tracer bullet 4: sort control, presentational only.
 *
 * A caption "Sort by" label next to a native <select> styled as a bordered input
 * control. Uncontrolled with a hardcoded defaultValue — no state, no handler, no
 * URL reading; the real sort wiring arrives with a later bullet.
 *
 * Owns no layout of its own so the same component can sit in the desktop sort
 * bar and, later, the mobile controls bar without either restyling it.
 */
export function SortDropdown() {
  return (
    <label className="group flex items-center gap-2">
      <span className="type-caption text-text-caption">Sort by</span>
      <select
        defaultValue="price-asc"
        className={`cursor-pointer rounded-sm border border-border-primary bg-transparent px-3 py-2 type-body text-text-secondary transition-colors group-hover:border-accent-500 hover:text-text-primary ${filterControlState.focusRing}`}
      >
        <option value="relevance">Relevance</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A–Z</option>
        <option value="newest">Newest</option>
      </select>
    </label>
  );
}
