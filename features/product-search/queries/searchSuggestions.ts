import { normalizeText, searchTerms } from '@/features/product-search/core/rules/searchText';
import { rankAutocomplete } from '@/features/product-search/core/rules/searchResults';
import type { AutocompleteProduct } from '@/features/product-search/core/types/searchTypes';
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
  const terms = searchTerms(rawQuery);

  try {
    let candidates = await source.fetchAutocompleteCandidates(terms);
    // Nothing for the words as typed: look again with spaces, symbols and the brand/name line ignored ("LCDX" finds "LCD-X").
    if (!candidates || candidates.length === 0) candidates = await source.fetchAutocompleteCandidates({ ...terms, loose: true });
    return rankAutocomplete(candidates ?? [], rawQuery, source.getCategoryLookup());
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}
