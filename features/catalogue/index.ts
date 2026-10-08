// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export { isFacetedQuery, canonicalCategoryPath } from './core/rules/seo';
export type { CategoryLookup, CategoryMetadata } from './core/rules/catalogue';
export { default as CatalogueCarousel } from './ui/CatalogueCarousel';
