'use server';

import { sanityFetch } from '@/platform/db/client';
import groq from 'groq';
import {
  normalizeText,
  deriveSpacedQuery,
  rankAutocomplete,
  buildSearchResult,
} from '@/features/product-search/domain';
import type {
  AutocompleteProduct,
  SearchProduct,
  SearchResult,
} from '@/features/product-search';
import type { ProductQueryState } from '@/features/product-filtering';

const MIN_QUERY_LENGTH = 2;
const DEFAULT_PER_PAGE = 24;
const MAX_SORT_WINDOW = 2000;

// One GROQ predicate for suggestions and results, so both see the same matched
// set. The suggestions score ALL of it (not just the first N by _id), which is
// what keeps the popup's top rows equal to the results page's top rows.
const SEARCH_MATCH = groq`_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
        name match $query ||
        name match $spacedQuery ||
        sku match $query ||
        brand._ref in *[_type == "brand" && (name match $query || name match $spacedQuery)]._id ||
        specifications[].value match $query ||
        specifications[].value match $spacedQuery ||
        overviewFields[].value match $query ||
        overviewFields[].value match $spacedQuery
      )`;

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH || normalizeText(query).length < MIN_QUERY_LENGTH) {
    return [];
  }

  const rawQuery = query.trim();
  const searchTerm = `${rawQuery}*`;
  const spacedTerm = `${deriveSpacedQuery(rawQuery)}*`;

  try {
    const candidates = await sanityFetch<AutocompleteProduct[]>({
      query: groq`*[${SEARCH_MATCH}] {
        _id,
        name,
        sku,
        catalogueLocationKeys,
        price_data,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        "availableStock": stock - reservedStock
      } | order(_id asc) [0...${MAX_SORT_WINDOW}]`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    return rankAutocomplete(candidates ?? [], rawQuery);
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}

export async function searchProductsFull(
  query: string,
  sort?: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE,
  state?: ProductQueryState,
  category?: string
): Promise<SearchResult> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH || normalizeText(query).length < MIN_QUERY_LENGTH) {
    return { products: [], totalCount: 0, unfilteredCount: 0 };
  }

  const rawQuery = query.trim();
  const searchTerm = `${rawQuery}*`;
  const spacedTerm = `${deriveSpacedQuery(rawQuery)}*`;

  const safePage = Math.max(1, Math.floor(page) || 1);
  const effectivePerPage = Math.max(1, Math.floor(perPage) || DEFAULT_PER_PAGE);

  const filterClause = SEARCH_MATCH;

  try {
    const countResult = await sanityFetch<number>({
      query: groq`count(*[${filterClause}])`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    const unfilteredCount = countResult ?? 0;
    if (unfilteredCount === 0) {
      return { products: [], totalCount: 0, unfilteredCount: 0 };
    }

    const sortWindow = Math.min(unfilteredCount, MAX_SORT_WINDOW);
    const matchedProducts = await sanityFetch<SearchProduct[]>({
      query: groq`*[${filterClause}] {
        _id,
        name,
        sku,
        price_data,
        stock,
        reservedStock,
        "availableStock": stock - reservedStock,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        catalogueLocationKeys,
        filterAttributes,
        "brandRef": brand->{ name, "slug": slug.current },
        "price": price_data.unit_amount
      } | order(_id asc) [0...${sortWindow}]`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    const matched = matchedProducts ?? [];

    return buildSearchResult({
      matched,
      unfilteredCount,
      rawQuery,
      sort,
      page: safePage,
      perPage: effectivePerPage,
      state,
      category,
    });
  } catch (error) {
    console.error(`[searchProductsFull] Failed for query "${query}", sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0, unfilteredCount: 0 };
  }
}
