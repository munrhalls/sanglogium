import type { AutocompleteProduct, FeatureProduct, SearchProduct, SearchTerms } from './types/searchTypes';
import type { CategoryLookup } from '@/features/catalogue';
import type { FilterPanelResult, Narrowing } from '@/features/product-filtering';

export type SearchSource = {
  getCategoryLookup(): CategoryLookup;
  fetchAutocompleteCandidates(terms: SearchTerms): Promise<AutocompleteProduct[] | null>;
  countSearchMatches(terms: SearchTerms): Promise<number | null>;
  fetchMatchedProducts(terms: SearchTerms, sortWindow: number): Promise<SearchProduct[] | null>;
  fetchNarrowedIds(terms: SearchTerms, narrowing: Narrowing): Promise<string[] | null>;
  getFilterPanel(products: FeatureProduct[], query: Record<string, string | string[] | undefined>): Promise<FilterPanelResult>;
};
