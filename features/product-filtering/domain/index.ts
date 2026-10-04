// Pure surface: values that lower layers (the data layer, another feature's domain) may import. Explicit named re-exports only; never bare export *.
export { buildProductQuery } from './buildProductQuery'
export { computeCatalogueFacets, isDefaultFilterState, productMatchesState } from './facetCounts'
export { sanitizeFilterState } from './sanitizeFilterState'
