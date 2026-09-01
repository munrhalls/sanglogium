/**
 * Small localStorage helper for the mobile search overlay's "Recent" list.
 * Zero-query state only — see sang-logium-85y. No search behaviour lives here.
 */

const STORAGE_KEY = 'sl:recent-searches';
const MAX_RECENT = 6;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === 'string').slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function getRecentSearches(): string[] {
  return read();
}

export function addRecentSearch(term: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = term.trim();
  if (!trimmed) return;
  const next = [
    trimmed,
    ...read().filter((t) => t.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
