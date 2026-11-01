import type { SortMap } from '@/features/product-filtering/core/types/optionMaps';

/** The fields the shopper can sort by in each scope: the always-on sorts, then the scope's sort picks, each once. */
export function sortFieldsOf(sortAlwaysOn: string[], sortPicks: Record<string, string[]>): SortMap {
  return Object.fromEntries(Object.entries(sortPicks).map(([scope, picks]) => [scope, [...new Set([...sortAlwaysOn, ...picks])]]));
}
