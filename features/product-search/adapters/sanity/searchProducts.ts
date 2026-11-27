import "server-only";

import { sanityFetch } from '@/platform/sanity/client';
import groq from 'groq';
import type { AutocompleteProduct, SearchProduct, SearchTerms } from '@/features/product-search/core/types/searchTypes';
import type { Narrowing } from '@/features/product-filtering';

const MAX_SORT_WINDOW = 2000;

// GROQ has no "replace": a value is written without spaces and symbols by splitting it at each symbol the
// catalogue's names, brands and SKUs hold today and joining the parts ("LCD-X" -> "lcdx").
const SYMBOLS = [' ', '-', ',', '.', '(', ')', '_', '&', '/', '"', '+', "'", '|', ':', '®', '–', '№'];
const joined = (value: string) =>
  SYMBOLS.reduce((expr, symbol) => `array::join(string::split(${expr}, ${JSON.stringify(symbol)}), "")`, `lower(${value})`);

// The words as typed: fast; every search tries this first.
const WORDS = `name match $query ||
        name match $spacedQuery ||
        sku match $query ||
        brand._ref in *[_type == "brand" && (name match $query || name match $spacedQuery)]._id ||
        specifications[].value match $query ||
        specifications[].value match $spacedQuery ||
        overviewFields[].value match $query ||
        overviewFields[].value match $spacedQuery`;

// Spaces, symbols and the line between brand and name ignored. About half a second per search, so it is added
// only when WORDS finds nothing (the queries set terms.loose).
const LOOSE = `(coalesce(brand->name, "") + " " + name) match $query ||
        (coalesce(brand->name, "") + " " + name) match $spacedQuery ||
        ${joined('name')} match $joinedAnywhere ||
        ${joined('coalesce(brand->name, "") + name')} match $joinedStart ||
        ${joined('sku')} match $joinedAnywhere`;

// One predicate for suggestions and results, so both see the same matched set. The suggestions score ALL of it
// (not just the first N by _id), which is what keeps the popup's top rows equal to the results page's top rows.
const searchMatch = (terms: SearchTerms) =>
  `_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (${WORDS}${terms.loose ? ` || ${LOOSE}` : ''})`;

const paramsOf = (terms: SearchTerms) => ({
  query: terms.query,
  spacedQuery: terms.spacedQuery,
  joinedAnywhere: terms.joinedAnywhere,
  joinedStart: terms.joinedStart,
});

export async function fetchAutocompleteCandidates(
  terms: SearchTerms
): Promise<AutocompleteProduct[] | null> {
  return sanityFetch<AutocompleteProduct[]>({
    query: groq`*[${searchMatch(terms)}] {
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
    params: paramsOf(terms),
  });
}

export async function countSearchMatches(
  terms: SearchTerms
): Promise<number | null> {
  return sanityFetch<number>({
    query: groq`count(*[${searchMatch(terms)}])`,
    params: paramsOf(terms),
  });
}

export async function fetchMatchedProducts(
  terms: SearchTerms,
  sortWindow: number
): Promise<SearchProduct[] | null> {
  return sanityFetch<SearchProduct[]>({
    query: groq`*[${searchMatch(terms)}] {
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
    params: paramsOf(terms),
  });
}

export async function fetchNarrowedIds(
  terms: SearchTerms,
  narrowing: Narrowing
): Promise<string[] | null> {
  return sanityFetch<string[]>({
    query: groq`*[${searchMatch(terms)} && (${narrowing.where})]._id`,
    params: { ...paramsOf(terms), ...narrowing.params },
  });
}
