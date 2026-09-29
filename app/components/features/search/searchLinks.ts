import type { MouseEvent } from 'react';

/**
 * Static link data + href helpers shared by the search UI (suggestion panel,
 * zero-query panel, empty results page).
 */

export const CATEGORY_SUGGESTIONS = [
  { label: 'Headphones', href: '/products/headphones' },
  { label: 'IEMs', href: '/products/headphones/monitors-iems' },
  { label: 'Audio Electronics', href: '/products/audio-electronics' },
  { label: 'Accessories', href: '/products/accessories' },
] as const;

// Brand / product-type terms only. Category names live in CATEGORY_SUGGESTIONS
// (they link straight to the category page), so they are not repeated here.
export const POPULAR_SEARCHES = ['Sennheiser', 'FiiO', 'DACs & Amps', 'Cables'] as const;

export function searchHref(term: string): string {
  return `/search?q=${encodeURIComponent(term.trim())}`;
}

export function productHref(slug: string): string {
  return `/product/${slug}`;
}

/** True for a plain primary-button click (not cmd/ctrl/shift/alt-click, which should open a new tab/window). */
export function isPlainLeftClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
