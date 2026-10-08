// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export { detectSearchRedirect } from './core/rules/detectSearchRedirect';
export type { AutocompleteProduct, SearchProduct, SearchResult } from './core/types/searchTypes';
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
export { fetchSearchSuggestionsAction } from './actions/fetchSearchSuggestionsAction';
