// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export type { NavigationItem } from './domain/catalogue';
export { getPageList } from './domain/pagination';
export { isFacetedQuery, canonicalCategoryPath } from './domain/seo';
