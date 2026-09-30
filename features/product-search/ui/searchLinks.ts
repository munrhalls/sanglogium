import type { MouseEvent } from 'react';

/**
 * Href helpers and click helper shared by the search UI (suggestion panel,
 * zero-query panel, empty results page).
 */

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
