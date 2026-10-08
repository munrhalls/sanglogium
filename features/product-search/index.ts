// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export { detectSearchRedirect } from './core/rules/detectSearchRedirect';
export { SearchHeader } from './ui/results/SearchHeader';
export { SearchError } from './ui/results/SearchError';
export { SearchResultsSkeleton } from './ui/results/SearchResultsSkeleton';
export { SearchBarTrigger } from './ui/field/SearchBarTrigger';
export { SearchFieldDesktop } from './ui/field/SearchFieldDesktop';
export { SearchSheet } from './ui/field/SearchSheet';
export { useSearchController } from './state/useSearchController';
export { useSearchOverlay } from './state/useSearchOverlay';
export { fetchSearchSuggestionsAction } from './actions/fetchSearchSuggestionsAction';
