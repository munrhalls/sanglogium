// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export { isCategory } from './core/definitions/facetRegistry';
export type { Category } from './core/definitions/facetRegistry';
export { CATEGORIES, CATEGORY_LABELS } from './core/definitions/category';
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
