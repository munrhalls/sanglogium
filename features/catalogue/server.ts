import 'server-only';
// Server-only entry: the JSON-backed catalogue tree accessors. Keeps data/catalogue-index.json out of client bundles.
// Never import from client components or Node .mjs scripts.
import type { CatalogueIndex } from './core/ports';
import * as catalogueIndexAdapter from './adapters/catalogue-index/catalogueIndex';

const catalogueIndex: CatalogueIndex = catalogueIndexAdapter;

export const resolveSlugToId = catalogueIndex.resolveSlugToId;
export const unrollDescendantKeys = catalogueIndex.unrollDescendantKeys;
export const getAllLeafKeys = catalogueIndex.getAllLeafKeys;
export const getCatalogueForNavigation = catalogueIndex.getCatalogueForNavigation;
export const getCategoryLookup = catalogueIndex.getCategoryLookup;

export { default as CatalogueNavbar } from './view/CatalogueNavbar';
