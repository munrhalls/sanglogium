import "server-only";

import { fetchAutocompleteCandidates, countSearchMatches, fetchMatchedProducts } from './adapters/sanity/searchProducts';
import { getCategoryLookup } from '@/features/catalogue/server';
import { getSearchSuggestions } from './queries/searchSuggestions';
import { searchProductsFullQuery } from './queries/searchProductsFull';
import type { SearchSource } from './core/ports';
import type { ProductQueryState } from '@/features/product-filtering';
import type { SearchResult } from './core/rules/searchTypes';
import type { AutocompleteProduct } from './core/rules/searchTypes';

const searchSource: SearchSource = {
  getCategoryLookup,
  fetchAutocompleteCandidates,
  countSearchMatches,
  fetchMatchedProducts,
};

export function getSuggestions(query: string): Promise<AutocompleteProduct[]> {
  return getSearchSuggestions(searchSource, query);
}

export function searchProductsFull(
  query: string,
  sort?: string,
  page: number = 1,
  perPage: number = 24,
  state?: ProductQueryState,
  category?: string
): Promise<SearchResult> {
  return searchProductsFullQuery(searchSource, query, sort, page, perPage, state, category);
}

export { SearchResults, SearchResultsSkeleton } from './view/SearchResults';
