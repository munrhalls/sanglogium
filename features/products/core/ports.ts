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

