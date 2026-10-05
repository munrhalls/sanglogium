import type { ProductQueryState } from '@/features/product-filtering';
import type { Product } from './productTypes';

export interface GetProductsCountOptions {
  keys: string[];
  // S1 (buildProductQuery): the active filter/sort state; clauses are built
  // here from it. Omitted = unfiltered count, exactly as before.
  state?: ProductQueryState;
}

export interface GetProductsChunkOptions {
  keys: string[];
  offset: number;
  limit: number;
  // S1 (buildProductQuery): the active filter/sort state; order/where clauses
  // and their named params are built here from it. Omitted = no clauses — the
  // raw slice order is Sanity's default, matching prior behaviour.
  state?: ProductQueryState;
}

export interface GetProductsOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  page?: number;    // 1-based page number
  perPage?: number; // Page size (capped at MAX_PRODUCTS_LIMIT)
}

export interface PaginatedProducts {
  products: Product[];
  totalCount: number; // Total across the whole filtered set, not the page window
}

export interface CategoryMetadata {
  id: string;
  name: string;
  slug: string | null;
  type: 'header' | 'link';
  parentId: string | null;
  breadcrumb: Array<{ label: string; href: string }>;
}

export interface SitemapSlug {
  slug: string;
  _updatedAt?: string;
}
