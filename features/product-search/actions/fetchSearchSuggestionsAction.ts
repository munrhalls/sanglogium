'use server';

import { getSuggestions } from '@/features/product-search/server';
import type { AutocompleteProduct } from '@/features/product-search/core/types/searchTypes';

export async function fetchSearchSuggestionsAction(query: string): Promise<AutocompleteProduct[]> {
  return getSuggestions(query);
}
