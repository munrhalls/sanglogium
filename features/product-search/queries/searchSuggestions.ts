import { normalizeText, deriveSpacedQuery } from '@/features/product-search/core/rules/searchText';
import { rankAutocomplete } from '@/features/product-search/core/rules/searchResults';
import type { AutocompleteProduct } from '@/features/product-search/core/rules/searchTypes';
import type { SearchSource } from '@/features/product-search/core/ports';

const MIN_QUERY_LENGTH = 2;

export async function getSearchSuggestions(
  source: SearchSource,
  query: string
): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH || normalizeText(query).length < MIN_QUERY_LENGTH) {
    return [];
  }

  const rawQuery = query.trim();
  const searchTerm = `${rawQuery}*`;
  const spacedTerm = `${deriveSpacedQuery(rawQuery)}*`;

  try {
    const candidates = await source.fetchAutocompleteCandidates(searchTerm, spacedTerm);
    return rankAutocomplete(candidates ?? [], rawQuery, source.getCategoryLookup());
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}
