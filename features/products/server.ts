import 'server-only';
// Server-only entry: wired catalog + wishlist ports and the session-aware wishlist read. Never import from client components or Node .mjs scripts.
import { getSession } from '@/features/auth/server';
import { getProductsByVfsKeys, getProductsCount, getProductsChunk } from './adapters/sanity/getProductsByVfsKeys';
import { getCategoryMetadata } from './adapters/sanity/getCategoryMetadata';
import { getProductBySlug } from './adapters/sanity/getProductBySlug';
import { getRelatedProducts } from './adapters/sanity/getRelatedProducts';
import { getSitemapSlugs } from './adapters/sanity/getSitemapSlugs';
import { addWishlistItem } from './adapters/sanity/addWishlistItem';
import { removeWishlistItem } from './adapters/sanity/removeWishlistItem';
import { getWishlistProductIdsByAuthId } from './adapters/sanity/getWishlistProductIdsByAuthId';
import { getWishlistProducts } from './adapters/sanity/getWishlistProducts';
import { createGetWishlistProductIds } from './queries/getWishlistProductIds';
import { createGetListingPage, createGetListingMetadata } from './queries/getListingPage';
import { createGetProductPage, createGetProductMetadata } from './queries/getProductPage';
import { createGetSitemapEntries } from './queries/getSitemapEntries';
import { resolveSlugToId, unrollDescendantKeys, getAllLeafKeys } from '@/features/catalogue/server';
import { getFilterFacets, getCategoryPriceRange } from '@/features/product-filtering/server';
import type { CatalogPorts, WishlistPorts } from './core/ports';
import type { ListingPorts } from './queries/getListingPage';

export const catalog: CatalogPorts = {
  getProductsByVfsKeys,
  getProductsCount,
  getProductsChunk,
  getCategoryMetadata,
  getProductBySlug,
  getRelatedProducts,
  getSitemapSlugs,
};

export const wishlist: WishlistPorts = {
  addWishlistItem,
  removeWishlistItem,
  getWishlistProductIdsByAuthId,
  getWishlistProducts,
};

export const getWishlistProductIds = createGetWishlistProductIds({ getSession, wishlist });

const listingPorts: ListingPorts = {
  catalogue: { resolveSlugToId, unrollDescendantKeys, getAllLeafKeys },
  filtering: { getFilterFacets, getCategoryPriceRange },
  catalog,
  getWishlistProductIds,
};

export const getListingPage = createGetListingPage(listingPorts);
export const getListingMetadata = createGetListingMetadata(listingPorts);
export const getProductPage = createGetProductPage({ catalog, getWishlistProductIds });
export const getProductMetadata = createGetProductMetadata({ catalog });
export const getSitemapEntries = createGetSitemapEntries({ catalog });

export { default as ListingPage } from './view/ListingPage';
export { default as ProductPageView } from './view/ProductPage';
export { default as WishlistPageView } from './view/WishlistPage';

export {
  getProductsByVfsKeys,
  getProductsCount,
  getProductsChunk,
  getCategoryMetadata,
  getProductBySlug,
  getRelatedProducts,
  getSitemapSlugs,
  getWishlistProducts,
};
export type { CategoryMetadata, SitemapSlug, GetProductsOptions, PaginatedProducts } from './core/rules/productDataTypes';
