import "server-only";

import { sanityFetch } from '@/platform/sanity/client';
import groq from 'groq';
import type { AutocompleteProduct, SearchProduct } from '@/features/product-search/core/rules/searchTypes';

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

export async function fetchAutocompleteCandidates(
  searchTerm: string,
  spacedTerm: string
): Promise<AutocompleteProduct[] | null> {
  return sanityFetch<AutocompleteProduct[]>({
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
}

export async function countSearchMatches(
  searchTerm: string,
  spacedTerm: string
): Promise<number | null> {
  return sanityFetch<number>({
    query: groq`count(*[${SEARCH_MATCH}])`,
    params: { query: searchTerm, spacedQuery: spacedTerm },
  });
}

export async function fetchMatchedProducts(
  searchTerm: string,
  spacedTerm: string,
  sortWindow: number
): Promise<SearchProduct[] | null> {
  return sanityFetch<SearchProduct[]>({
    query: groq`*[${SEARCH_MATCH}] {
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
}
