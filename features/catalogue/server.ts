import 'server-only';
// Server-only entry: the JSON-backed catalogue tree accessors and the category breadcrumbs. Keeps data/catalogue-index.json out of client bundles.
// Never import from client components or Node .mjs scripts.
export { resolveSlugToId, unrollDescendantKeys, getAllLeafKeys, getCatalogueForNavigation } from './domain/catalogue';
export { default as Breadcrumbs } from './ui/CategoryBreadcrumbs';
