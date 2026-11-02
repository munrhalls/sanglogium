// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export { isCategory, CATEGORIES, CATEGORY_LABELS } from './core/definitions/category';
export type { Category } from './core/definitions/category';
export { FilterPanel } from './ui/FilterPanel';
export { FilterSheet } from './ui/FilterSheet';
export { ActiveFilters } from './ui/ActiveFilters';
export { SortControl } from './ui/SortControl';
export { scopeOf } from './core/rules/scopeOf';
export type { FilterPanelData, FilterPanelResult } from './core/types/filterPanel';
export type { Narrowing } from './core/types/narrowing';
