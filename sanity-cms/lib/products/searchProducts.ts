'use server';

import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { buildSearchOrderClause } from '@/lib/catalogue/filterParams';

const MAX_AUTOCOMPLETE = 6;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_PER_PAGE = 24;

export interface AutocompleteProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  slug: { current: string };
  image: any;
}

export interface SearchProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  availableStock: number;
  slug: { current: string };
  image: any;
  catalogueLocationKeys: string[];
}

export interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
}

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const searchTerm = `${query.trim()}*`;

  try {
    return await sanityFetch<AutocompleteProduct[]>({
      query: groq`*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
        name match $query ||
        sku match $query ||
        brand._ref in *[_type == "brand" && name match $query]._id ||
        specifications[].value match $query ||
        overviewFields[].value match $query
      )] {
        _id,
        name,
        price_data,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        "score": select(
          name match $query => 20,
          brand->name match $query => 15,
          10
        )
      } | order(score desc, name asc) [0...${MAX_AUTOCOMPLETE}]`,
      params: { query: searchTerm },
    });
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}

export async function searchProductsFull(
  query: string,
  sort?: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
): Promise<SearchResult> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return { products: [], totalCount: 0 };
  }

  const searchTerm = `${query.trim()}*`;

  // Allow-listed order clause (relevance default; explicit sorts carry NO score
  // prefix so a chosen sort is the real order) — G1.
  const orderClause = buildSearchOrderClause(sort);

  // Floor the requested page; out-of-range pages are clamped to totalPages after
  // the count resolves so the user never sees a false empty state — G2.
  const safePage = Math.max(1, Math.floor(page) || 1);
  const effectivePerPage = Math.max(1, Math.floor(perPage) || DEFAULT_PER_PAGE);

  const filterClause = groq`_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
    name match $query ||
    sku match $query ||
    brand._ref in *[_type == "brand" && name match $query]._id ||
    specifications[].value match $query ||
    overviewFields[].value match $query
  )`;

  const windowQuery = (offset: number, end: number) =>
    groq`*[${filterClause}] {
      _id,
      name,
      price_data,
      stock,
      reservedStock,
      "availableStock": stock - reservedStock,
      "brand": brand->{ _id, name, slug },
      slug,
      image,
      catalogueLocationKeys,
      "score": select(
        name match $query => 20,
        brand->name match $query => 15,
        10
      )
    } ${orderClause} [${offset}...${end}]`;

  try {
    // Fetch total count and the requested window in parallel (common case).
    const [countResult, products] = await Promise.all([
      sanityFetch<number>({
        query: groq`count(*[${filterClause}])`,
        params: { query: searchTerm },
      }),
      sanityFetch<SearchProduct[]>({
        query: windowQuery((safePage - 1) * effectivePerPage, safePage * effectivePerPage),
        params: { query: searchTerm },
      }),
    ]);

    const totalCount = countResult ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / effectivePerPage));
    const effectivePage = totalCount > 0 ? Math.min(safePage, totalPages) : safePage;

    // Out-of-range page requested: re-fetch the clamped last-page window (G2).
    if (effectivePage !== safePage) {
      const clampedOffset = (effectivePage - 1) * effectivePerPage;
      const clampedEnd = clampedOffset + effectivePerPage;
      const clampedProducts = await sanityFetch<SearchProduct[]>({
        query: windowQuery(clampedOffset, clampedEnd),
        params: { query: searchTerm },
      });
      return { products: clampedProducts ?? [], totalCount };
    }

    return { products: products ?? [], totalCount };
  } catch (error) {
    console.error(`[searchProductsFull] Failed for query "${query}", sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0 };
  }
}
