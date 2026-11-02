import type { Narrowing } from '@/features/product-filtering';
import type { Product } from './productTypes';

// The shopper's selections as the filter feature narrows the products request: its `where` and `order` and the named parameters both use.
export interface GetNarrowedCountOptions {
  keys: string[];
  narrowing: Narrowing;
}

export interface GetNarrowedChunkOptions {
  keys: string[];
  narrowing: Narrowing;
  offset: number;
  limit: number;
}

export type { CategoryMetadata } from '@/features/catalogue';

export interface SitemapSlug {
  slug: string;
  _updatedAt?: string;
}
