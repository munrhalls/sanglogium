// Client-safe public entry. Routes, sanity-cms and other features import ONLY from here or from ./server.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { isCategory } from './config/facetRegistry';
export type { Category } from './config/facetRegistry';
export { loadFilterSort, SORT_DEFAULT } from './config/filterSortParams';
export { FILTER_FACETS, isPlaceholderVocab } from './config/facetMap';
export type { FilterFacet } from './config/facetMap';
export { sanitizeFilterState } from './domain/sanitizeFilterState';
export { humanizeFacetValue } from './domain/humanizeFacetValue';
export { isFiltersActive } from './domain/buildProductQuery';
export type { ProductQueryState } from './domain/buildProductQuery';
export { resolvePriceBounds } from './domain/priceBounds';
export type { PriceRangeData } from './domain/priceBounds';
export { FilterSidebar } from './ui/FilterSidebar';
export { SortBar } from './ui/SortBar';
export { ActiveFilterChips } from './ui/ActiveFilterChips';
export { MobileFilterSheet } from './ui/MobileFilterSheet';
export { useClearAllFilters } from './ui/useFilterParam';
