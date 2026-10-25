// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export { isCategory, CATEGORIES, CATEGORY_LABELS } from './core/definitions/category';
export type { Category } from './core/definitions/category';
export { loadFilterSort, loadFacetFilterState, SORT_DEFAULT, isFiltersActive } from './url/filterSortParams';
export { sanitizeFilterState } from './core/rules/sanitizeFilterState';
export {
  computeCatalogueFacets,
  productMatchesState,
} from './core/rules/facetCounts';
export { buildFacetSet } from './core/rules/buildFacetSet';
export type { ProductQueryState, RawProduct, FilterQuery } from './core/types/filterTypes';
export type { FacetSet } from './core/types/facetProjection';
export { resolvePriceBounds } from './core/rules/priceBounds';
export type { PriceRangeData } from './core/rules/priceBounds';
export type { CatalogueFacets } from './core/rules/facetCounts';
export { FilterSidebar } from './ui/FilterSidebar';
export { SortBar } from './ui/SortBar';
export { ActiveFilterChips } from './ui/ActiveFilterChips';
export { MobileFilterSheet } from './ui/MobileFilterSheet';
export { useClearAllFilters } from './state/useFilterParam';
