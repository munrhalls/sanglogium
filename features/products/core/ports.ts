import type { Product, ProductDetailData, RelatedProduct } from './types/productTypes';
import type {
  CategoryMetadata,
  GetNarrowedChunkOptions,
  GetNarrowedCountOptions,
  SitemapSlug,
} from './types/productDataTypes';

export type CatalogPorts = {
  getNarrowedCount: (options: GetNarrowedCountOptions) => Promise<number>;
  getNarrowedChunk: (options: GetNarrowedChunkOptions) => Promise<Product[]>;
  getCategoryMetadata: (key: string) => Promise<CategoryMetadata | null>;
  getProductBySlug: (slug: string) => Promise<ProductDetailData | null>;
  getRelatedProducts: (currentId: string, catalogueKeys: string[], limit?: number) => Promise<RelatedProduct[]>;
  getSitemapSlugs: () => Promise<{ products: SitemapSlug[]; categories: SitemapSlug[] }>;
};
