// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here or from ./server.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { detectSearchRedirect } from './domain/detectSearchRedirect';
export { SearchHeader } from './ui/SearchHeader';
export { SearchError } from './ui/SearchError';
export { SearchEmpty } from './ui/SearchEmpty';
export { SearchPagination } from './ui/SearchPagination';
export { SearchSort } from './ui/SearchSort';
export { SearchCategoryChips } from './ui/SearchCategoryChips';
export { SearchBarTrigger } from './ui/SearchBarTrigger';
export { SearchFieldDesktop } from './ui/SearchFieldDesktop';
export { SearchSheet } from './ui/SearchSheet';
export { useSearchController } from './ui/useSearchController';
export { useSearchOverlay } from './ui/useSearchOverlay';
