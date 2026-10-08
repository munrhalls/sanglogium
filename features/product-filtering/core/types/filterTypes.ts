// Types shared by the slice's pure rules: the filter/sort state shape every
// rule consumes and the product shape the in-memory matching engine reads.

import type { SortValue } from '@/features/product-filtering/core/definitions/facetMap';

// Shape matches the server-side loader (url/filterSortParsers) so RSC and
// client always agree: sort/price/inStock plus one key per facet urlParam.
// The index signature keeps the dynamic facet keys type-safe and extensible.
export interface ProductQueryState {
  sort: SortValue;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  [key: string]: unknown;
}

export interface RawProduct {
  _id: string;
  filterAttributes?: Record<string, unknown>;
  brandRef?: { name: string; slug: string } | null;
  price?: number;
  stock?: number;
  reservedStock?: number;
}
