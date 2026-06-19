import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { FilterBuilder } from './FilterBuilder';
import { buildOrderClause, DEFAULT_PER_PAGE } from '@/lib/catalogue/filterParams';
import { cache } from 'react';
import type { Product as SanityProduct } from '@/sanity.types';

// Pagination safety limit - prevents unbounded queries
const MAX_PRODUCTS_LIMIT = 100;

// React cache is only available in React Server Components
// In test environments, we skip caching
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn) as T;
  } catch {
    return fn;
  }
};

// Product type matching actual GROQ query result (brand is dereferenced with ->)
export type Product = {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  catalogueLocationKeys: string[];
  slug: { current: string };
  stock: number;
  reservedStock: number;
  availableStock: number;
};

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

const getProductsByVfsKeysFn = async ({
  keys,
  sort = 'featured',
  filters = [],
  page = 1,
  perPage = DEFAULT_PER_PAGE
}: GetProductsOptions): Promise<PaginatedProducts> => {
  if (!keys.length) {
    return { products: [], totalCount: 0 };
  }

  // Cap the page size at MAX_PRODUCTS_LIMIT and compute the window offsets.
  const effectivePerPage = Math.min(Math.max(1, Math.floor(perPage) || 1), MAX_PRODUCTS_LIMIT);
  const safePage = Math.max(1, Math.floor(page) || 1);
  const offset = (safePage - 1) * effectivePerPage;
  const end = offset + effectivePerPage;

  // Build sort clause from the allow-listed contract. Unknown or crafted sort
  // values fall back to the default (no order clause), so raw input can never
  // be interpolated into GROQ (B1).
  const orderClause = buildOrderClause(sort);

  // Build filter clause using FilterBuilder
  const filterClause = FilterBuilder.buildClause(filters);

  // Sort is applied BEFORE the slice, so the page window reflects the global order.
  const productsQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [${offset}...${end}] {
      _id,
      name,
      brand->{
        _id,
        name,
        slug
      },
      price_data,
      stock,
      reservedStock,
      "availableStock": stock - reservedStock,
      image {
        asset {
          _ref
        }
      },
      slug {
        current
      },
      catalogueLocationKeys
    }`;

  // Total count across the full filtered set (not the page window) — A1.
  const countQuery = groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}])`;

  try {
    const [totalCount, products] = await Promise.all([
      sanityFetch<number>({ query: countQuery, params: { keys } }),
      sanityFetch<Product[]>({ query: productsQuery, params: { keys } })
    ]);
    return { products: products ?? [], totalCount: totalCount ?? 0 };
  } catch (error) {
    console.error(`[getProductsByVfsKeys] Failed for ${keys.length} keys, sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0 };
  }
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<PaginatedProducts>;
