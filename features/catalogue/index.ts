// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions.
// Never re-export server-only or Sanity code here.
// Explicit named re-exports only; never bare export *.
export { isFacetedQuery, canonicalCategoryPath } from './core/rules/seo';
export type { CategoryLookup } from './core/rules/catalogue';
export { default as CatalogueCarousel } from './ui/CatalogueCarousel';
