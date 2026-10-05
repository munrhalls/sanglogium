import type { AutocompleteProduct, SearchProduct } from './rules/searchTypes';

export type SearchSource = {
  fetchAutocompleteCandidates(searchTerm: string, spacedTerm: string): Promise<AutocompleteProduct[] | null>;
  countSearchMatches(searchTerm: string, spacedTerm: string): Promise<number | null>;
  fetchMatchedProducts(searchTerm: string, spacedTerm: string, sortWindow: number): Promise<SearchProduct[] | null>;
};
