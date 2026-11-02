import "server-only";

import { fetchAutocompleteCandidates, countSearchMatches, fetchMatchedProducts, fetchNarrowedIds } from './adapters/sanity/searchProducts';
import { getCategoryLookup } from '@/features/catalogue/server';
import { getFilterPanelOver } from '@/features/product-filtering/server';
import { scopeOf } from '@/features/product-filtering';
import { getSearchSuggestions } from './queries/searchSuggestions';
import { getSearchPage as getSearchPageQuery, type SearchParams } from './queries/getSearchPage';
import type { SearchSource } from './core/ports';
import type { AutocompleteProduct } from './core/types/searchTypes';

const searchSource: SearchSource = {
  getCategoryLookup,
  fetchAutocompleteCandidates,
  countSearchMatches,
  fetchMatchedProducts,
  fetchNarrowedIds,
  getFilterPanel: (products, query) => getFilterPanelOver(products, { scope: scopeOf(null), query }),
};

export function getSuggestions(query: string): Promise<AutocompleteProduct[]> {
  return getSearchSuggestions(searchSource, query);
}

export function getSearchPage(params: SearchParams) {
  return getSearchPageQuery(searchSource, params);
}

export { getSearchMetadata } from './core/rules/searchMetadata';

export { SearchResultsView } from './view/SearchResultsView';
