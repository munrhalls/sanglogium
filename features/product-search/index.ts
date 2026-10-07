// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here or from ./domain.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { detectSearchRedirect } from './core/rules/detectSearchRedirect';
export type { AutocompleteProduct, SearchProduct, SearchResult } from './core/rules/searchTypes';
export { SearchHeader } from './ui/results/SearchHeader';
export { SearchError } from './ui/results/SearchError';
export { SearchEmpty } from './ui/results/SearchEmpty';
export { SearchPagination } from './ui/results/SearchPagination';
export { SearchSort } from './ui/results/SearchSort';
export { SearchCategoryChips } from './ui/results/SearchCategoryChips';
export { SearchResultsSkeleton } from './ui/results/SearchResultsSkeleton';
export { SearchBarTrigger } from './ui/field/SearchBarTrigger';
export { SearchFieldDesktop } from './ui/field/SearchFieldDesktop';
export { SearchSheet } from './ui/field/SearchSheet';
export { useSearchController } from './state/useSearchController';
export { useSearchOverlay } from './state/useSearchOverlay';
export { normalizeText, deriveSpacedQuery } from './core/rules/searchText';
export { fetchSearchSuggestions } from './commands/fetchSearchSuggestions';
