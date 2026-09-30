// Client-safe public entry. Routes, sanity-cms and other features import ONLY from here or from ./server.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { getFacetModule, resolveGroupIcon, isCategory } from './config/facetRegistry';
export type { Category, AnyFacetDef, FacetOptionCount } from './config/facetRegistry';
export {
  loadFilterSort,
  SORT_DEFAULT,
  filterSortParsers,
  FILTER_SORT_URL_OPTIONS,
  PAGE_PARAM_KEY,
} from './config/filterSortParams';
export type { SortValue } from './config/filterSortParams';
export { FILTER_FACETS, isPlaceholderVocab } from './config/facetMap';
export type { FilterFacet } from './config/facetMap';
export { sanitizeFilterState } from './domain/sanitizeFilterState';
export { humanizeFacetValue } from './domain/humanizeFacetValue';
export { isFiltersActive } from './domain/buildProductQuery';
export type { ProductQueryState, ProductQuery } from './domain/buildProductQuery';
export {
  resolvePriceBounds,
  DEFAULT_PRICE_CEILING,
  NORMAL_PRICE_CEILING,
  PREMIUM_TIERS,
  PREMIUM_TIER_MIN,
} from './domain/priceBounds';
export type { PriceRangeData } from './domain/priceBounds';
