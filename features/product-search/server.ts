import "server-only";

import { fetchAutocompleteCandidates, countSearchMatches, fetchMatchedProducts, fetchNarrowedIds } from './adapters/sanity/searchProducts';
import { getCategoryLookup } from '@/features/catalogue/server';
import { getFilterPanelOver } from '@/features/product-filtering/server';
import { scopeOf } from '@/features/product-filtering';
import { getSearchSuggestions } from './queries/searchSuggestions';
import { getSearchPage as getSearchPageQuery, type SearchParams } from './queries/getSearchPage';
import type { SearchPage } from './queries/getSearchPage';
import { createVisitorLimit } from './core/rules/visitorLimit';
import { visitorKey } from './adapters/next/visitorKey';
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

// One visitor's searches that reach the catalogue: at most this many a minute, suggestions and /search pages together.
const SEARCHES_PER_MINUTE = 120;
const visitorLimit = createVisitorLimit(SEARCHES_PER_MINUTE);

export async function getSuggestions(query: string): Promise<AutocompleteProduct[]> {
  if (!visitorLimit.allow(await visitorKey())) return [];
  return getSearchSuggestions(searchSource, query);
}

export async function getSearchPage(params: SearchParams): Promise<SearchPage> {
  if (!visitorLimit.allow(await visitorKey())) {
    const q = Array.isArray(params.q) ? params.q[0] : params.q;
    return { kind: 'results', query: typeof q === 'string' ? q : '', resultsPromise: Promise.resolve({ products: [], totalCount: 0, unfilteredCount: 0 }) };
  }
  return getSearchPageQuery(searchSource, params);
}

export { getSearchMetadata } from './core/rules/searchMetadata';

export { SearchResultsView } from './view/SearchResultsView';
