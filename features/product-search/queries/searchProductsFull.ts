import { normalizeText, deriveSpacedQuery } from '@/features/product-search/core/rules/searchScoring';
import { buildSearchResult } from '@/features/product-search/core/rules/searchResults';
import type { SearchResult } from '@/features/product-search/core/rules/searchTypes';
import type { SearchSource } from '@/features/product-search/core/ports';
import type { ProductQueryState } from '@/features/product-filtering';

const MIN_QUERY_LENGTH = 2;
const DEFAULT_PER_PAGE = 24;
const MAX_SORT_WINDOW = 2000;

export async function searchProductsFullQuery(
  source: SearchSource,
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

  try {
    const countResult = await source.countSearchMatches(searchTerm, spacedTerm);

    const unfilteredCount = countResult ?? 0;
    if (unfilteredCount === 0) {
      return { products: [], totalCount: 0, unfilteredCount: 0 };
    }

    const sortWindow = Math.min(unfilteredCount, MAX_SORT_WINDOW);
    const matchedProducts = await source.fetchMatchedProducts(searchTerm, spacedTerm, sortWindow);

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
