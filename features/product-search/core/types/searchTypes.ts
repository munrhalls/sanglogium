import type { RootCategory } from '@/features/product-search/core/rules/searchScoring';
import type {
  CatalogueFacets,
  ProductQueryState,
  PriceRangeData,
} from '@/features/product-filtering';

export interface AutocompleteProduct {
  _id: string;
  name: string;
  sku?: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  slug: { current: string };
  image: any;
  catalogueLocationKeys?: string[];
  availableStock?: number;
}

export interface SearchProduct {
  _id: string;
  name: string;
  sku?: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  availableStock: number;
  slug: { current: string };
  image: any;
  catalogueLocationKeys: string[];
  filterAttributes?: Record<string, unknown>;
  brandRef?: { name: string; slug: string } | null;
  price?: number;
}

export interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
  /** Products matching the words alone, before any filter is applied. */
  unfilteredCount: number;
  facets?: CatalogueFacets;
  priceRange?: PriceRangeData;
  /** The filter state actually applied (junk brand values dropped). */
  state?: ProductQueryState;
  /** Root category the results are narrowed to, when a valid one was requested. */
  category?: RootCategory;
  /** Per-category counts under the active filters (ignoring the category itself). */
  categoryCounts?: { id: RootCategory; label: string; count: number }[];
  /** Products matching the active filters across all categories. */
  allCategoriesCount?: number;
}
