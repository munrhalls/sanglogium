// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here or from ./server.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { detectSearchRedirect } from './domain/detectSearchRedirect';
export type { AutocompleteProduct, SearchProduct, SearchResult } from './domain/searchTypes';
export { SearchHeader } from './ui/results/SearchHeader';
export { SearchError } from './ui/results/SearchError';
export { SearchEmpty } from './ui/results/SearchEmpty';
export { SearchPagination } from './ui/results/SearchPagination';
export { SearchSort } from './ui/results/SearchSort';
export { SearchCategoryChips } from './ui/results/SearchCategoryChips';
export { SearchBarTrigger } from './ui/field/SearchBarTrigger';
export { SearchFieldDesktop } from './ui/field/SearchFieldDesktop';
export { SearchSheet } from './ui/field/SearchSheet';
export { useSearchController } from './model/useSearchController';
export { useSearchOverlay } from './model/useSearchOverlay';
