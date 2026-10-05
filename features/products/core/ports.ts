import type { Product, ProductDetailData, RelatedProduct } from './rules/productTypes';
import type {
  CategoryMetadata,
  GetProductsChunkOptions,
  GetProductsCountOptions,
  GetProductsOptions,
  PaginatedProducts,
  SitemapSlug,
} from './rules/productDataTypes';

export type CatalogPorts = {
  getProductsByVfsKeys: (options: GetProductsOptions) => Promise<PaginatedProducts>;
  getProductsCount: (options: GetProductsCountOptions) => Promise<number>;
  getProductsChunk: (options: GetProductsChunkOptions) => Promise<Product[]>;
  getCategoryMetadata: (key: string) => Promise<CategoryMetadata | null>;
  getProductBySlug: (slug: string) => Promise<ProductDetailData | null>;
  getRelatedProducts: (currentId: string, catalogueKeys: string[], limit?: number) => Promise<RelatedProduct[]>;
  getSitemapSlugs: () => Promise<{ products: SitemapSlug[]; categories: SitemapSlug[] }>;
};

export type WishlistPorts = {
  addWishlistItem: (profileId: string, productId: string) => Promise<void>;
  removeWishlistItem: (profileId: string, productId: string) => Promise<void>;
  getWishlistProductIdsByAuthId: (authId: string) => Promise<string[]>;
  getWishlistProducts: (authId: string) => Promise<Product[]>;
};

export type WishlistQueryPorts = {
  getSession: () => Promise<{ userId: string } | null>;
  wishlist: WishlistPorts;
};
