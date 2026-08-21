import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { cache } from 'react';
import type { Product as SanityProduct } from '@/sanity.types';

const DEFAULT_PER_PAGE = 24;

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

  // Cap the page size at MAX_PRODUCTS_LIMIT. The requested page is floored at 1
  // here and clamped to totalPages after the count resolves (G2), so an
  // out-of-range ?page= renders the last page instead of an empty window.
  const effectivePerPage = Math.min(Math.max(1, Math.floor(perPage) || 1), MAX_PRODUCTS_LIMIT);
  const safePage = Math.max(1, Math.floor(page) || 1);

  // Total count across the full product set (not the page window) — A1.
  const countQuery = groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0])`;

  try {
    const totalCount = (await sanityFetch<number>({ query: countQuery, params: { keys } })) ?? 0;

    // Clamp the page to totalPages so an out-of-range ?page= renders the last
    // page instead of a misleading empty window. totalCount stays the full
    // filtered total (A1). When nothing matches, no clamp applies (zero results).
    const totalPages = Math.ceil(totalCount / effectivePerPage);
    const effectivePage = totalPages > 0 ? Math.min(safePage, totalPages) : safePage;
    const offset = (effectivePage - 1) * effectivePerPage;
    const end = offset + effectivePerPage;

    const productsQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] [${offset}...${end}] {
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

    const products = await sanityFetch<Product[]>({ query: productsQuery, params: { keys } });
    return { products: products ?? [], totalCount };
  } catch (error) {
    console.error(`[getProductsByVfsKeys] Failed for ${keys.length} keys, sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0 };
  }
};

export const getProductsByVfsKeys = withCache(getProductsByVfsKeysFn) as (options: GetProductsOptions) => Promise<PaginatedProducts>;
