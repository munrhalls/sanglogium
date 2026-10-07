'use server';

import { getSuggestions } from '@/features/product-search/server';
import type { AutocompleteProduct } from '@/features/product-search/core/rules/searchTypes';

export async function fetchSearchSuggestionsAction(query: string): Promise<AutocompleteProduct[]> {
  return getSuggestions(query);
}
