import { loadFilterSort, type ProductQueryState } from '@/features/product-filtering';
import { detectSearchRedirect } from '@/features/product-search/core/rules/detectSearchRedirect';
import type { SearchSource } from '@/features/product-search/core/ports';
import type { SearchResult } from '@/features/product-search/core/types/searchTypes';
import { searchProductsFullQuery } from '@/features/product-search/queries/searchProductsFull';

export type SearchParams = Record<string, string | string[] | undefined>;

export type SearchPage =
  | { kind: 'redirect'; to: string }
  | { kind: 'results'; query: string; resultsPromise: Promise<SearchResult> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function getSearchPage(source: SearchSource, params: SearchParams): SearchPage {
  const qValue = first(params.q);
  const q = typeof qValue === 'string' ? qValue : '';

  const redirectTo = detectSearchRedirect(q);
  if (redirectTo) {
    return { kind: 'redirect', to: redirectTo };
  }

  const pageValue = first(params.page);
  const page = typeof pageValue === 'string' ? Number(pageValue) : 1;

  const sortValue = first(params.sort);
  const sort = typeof sortValue === 'string' ? sortValue : undefined;

  // Same URL contract as the catalogue. `sort` is NOT taken from here: its
  // vocabulary has no `relevance`, so searchProductsFullQuery validates the raw value.
  const filterState = loadFilterSort(params) as ProductQueryState;

  const catValue = first(params.cat);
  const category = typeof catValue === 'string' ? catValue : undefined;

  return {
    kind: 'results',
    query: q,
    resultsPromise: searchProductsFullQuery(source, q, sort, page, undefined, filterState, category),
  };
}
