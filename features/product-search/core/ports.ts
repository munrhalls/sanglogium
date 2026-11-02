import type { AutocompleteProduct, FeatureProduct, SearchProduct } from './types/searchTypes';
import type { CategoryLookup } from '@/features/catalogue';
import type { FilterPanelResult, Narrowing } from '@/features/product-filtering';

export type SearchSource = {
  getCategoryLookup(): CategoryLookup;
  fetchAutocompleteCandidates(searchTerm: string, spacedTerm: string): Promise<AutocompleteProduct[] | null>;
  countSearchMatches(searchTerm: string, spacedTerm: string): Promise<number | null>;
  fetchMatchedProducts(searchTerm: string, spacedTerm: string, sortWindow: number): Promise<SearchProduct[] | null>;
  fetchNarrowedIds(searchTerm: string, spacedTerm: string, narrowing: Narrowing): Promise<string[] | null>;
  getFilterPanel(products: FeatureProduct[], query: Record<string, string | string[] | undefined>): Promise<FilterPanelResult>;
};
