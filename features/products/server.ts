import 'server-only';
// Server-only entry: wired catalog ports. Never import from client components or Node .mjs scripts.
import { getProductsByVfsKeys, getProductsCount, getProductsChunk } from './adapters/sanity/getProductsByVfsKeys';
import { getProductBySlug } from './adapters/sanity/getProductBySlug';
import { getRelatedProducts } from './adapters/sanity/getRelatedProducts';
import { getSitemapSlugs } from './adapters/sanity/getSitemapSlugs';
import { getListingPage as getListingPageQuery, getListingMetadata as getListingMetadataQuery } from './queries/getListingPage';
import { getProductPage as getProductPageQuery, getProductMetadata as getProductMetadataQuery } from './queries/getProductPage';
import { getSitemapEntries as getSitemapEntriesQuery } from './queries/getSitemapEntries';
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

export const getListingPage = (input: Parameters<typeof getListingPageQuery>[1]) => getListingPageQuery(listingPorts, input);
export const getListingMetadata = (input: Parameters<typeof getListingMetadataQuery>[1]) => getListingMetadataQuery(listingPorts, input);
export const getProductPage = (slug: string) => getProductPageQuery({ catalog }, slug);
export const getProductMetadata = (slug: string) => getProductMetadataQuery({ catalog }, slug);
export const getSitemapEntries = () => getSitemapEntriesQuery({ catalog });

export { default as ListingView } from './view/ListingView';
export { default as ProductView } from './view/ProductView';
