import 'server-only';
// Server-only entry: wired catalog ports. Never import from client components or Node .mjs scripts.
import { getProductsByVfsKeys, getProductsCount, getProductsChunk } from './adapters/sanity/getProductsByVfsKeys';
import { getProductBySlug } from './adapters/sanity/getProductBySlug';
import { getRelatedProducts } from './adapters/sanity/getRelatedProducts';
import { getSitemapSlugs } from './adapters/sanity/getSitemapSlugs';
import { createGetListingPage, createGetListingMetadata } from './queries/getListingPage';
import { createGetProductPage, createGetProductMetadata } from './queries/getProductPage';
import { createGetSitemapEntries } from './queries/getSitemapEntries';
import { resolveSlugToId, unrollDescendantKeys, getAllLeafKeys, getCategoryMetadata, getBreadcrumbLabels } from '@/features/catalogue/server';
import { getFilterFacets, getCategoryPriceRange } from '@/features/product-filtering/server';
import type { CatalogPorts } from './core/ports';
import type { ListingPorts } from './queries/getListingPage';

const catalog: CatalogPorts = {
  getProductsByVfsKeys,
  getProductsCount,
  getProductsChunk,
  getCategoryMetadata,
  getProductBySlug,
  getRelatedProducts,
  getSitemapSlugs,
};

const listingPorts: ListingPorts = {
  catalogue: { resolveSlugToId, unrollDescendantKeys, getAllLeafKeys, getBreadcrumbLabels },
  filtering: { getFilterFacets, getCategoryPriceRange },
  catalog,
};

export const getListingPage = createGetListingPage(listingPorts);
export const getListingMetadata = createGetListingMetadata(listingPorts);
export const getProductPage = createGetProductPage({ catalog });
export const getProductMetadata = createGetProductMetadata({ catalog });
export const getSitemapEntries = createGetSitemapEntries({ catalog });

export { default as ListingView } from './view/ListingView';
export { default as ProductView } from './view/ProductView';
