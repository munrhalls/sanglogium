import type { AutocompleteProduct, SearchProduct } from './types/searchTypes';
import type { CategoryLookup } from '@/features/catalogue';

export type SearchSource = {
  getCategoryLookup(): CategoryLookup;
  fetchAutocompleteCandidates(searchTerm: string, spacedTerm: string): Promise<AutocompleteProduct[] | null>;
  countSearchMatches(searchTerm: string, spacedTerm: string): Promise<number | null>;
  fetchMatchedProducts(searchTerm: string, spacedTerm: string, sortWindow: number): Promise<SearchProduct[] | null>;
};
