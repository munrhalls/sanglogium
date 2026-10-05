// Client-safe public entry. Routes, sanity-cms and other features import ONLY from here (client) or ./server (server).
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { isCategory } from './core/definitions/facetRegistry';
export type { Category } from './core/definitions/facetRegistry';
export { loadFilterSort, SORT_DEFAULT, isFiltersActive } from './url/filterSortParams';
export { FILTER_FACETS, isPlaceholderVocab } from './core/definitions/facetMap';
export type { FilterFacet } from './core/definitions/facetMap';
export { sanitizeFilterState } from './core/rules/sanitizeFilterState';
export {
  computeCatalogueFacets,
  isDefaultFilterState,
  productMatchesState,
} from './core/rules/facetCounts';
export { humanizeFacetValue } from './core/rules/humanizeFacetValue';
export type { ProductQueryState, RawProduct } from './core/rules/filterTypes';
export { resolvePriceBounds } from './core/rules/priceBounds';
export type { PriceRangeData } from './core/rules/priceBounds';
export type { CatalogueFacets } from './core/rules/facetCounts';
export { FilterSidebar } from './ui/FilterSidebar';
export { SortBar } from './ui/SortBar';
export { ActiveFilterChips } from './ui/ActiveFilterChips';
export { MobileFilterSheet } from './ui/MobileFilterSheet';
export { useClearAllFilters } from './state/useFilterParam';
