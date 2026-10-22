// Guard for the URL side. facetMap.ts keeps hand-typed value lists that sanitizeFilterState vets selections
// against. A data value missing from them would render as an option the shopper can tick and the server
// would then drop, so such an option is hidden and reported instead. An option stays only if
// sanitizeFilterState keeps it: this reuses the real check, it adds no list of its own.

import { sanitizeFilterState } from './sanitizeFilterState';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';

const NO_FILTERS: ProductQueryState = { sort: 'newest', minPrice: null, maxPrice: null, inStock: false };

export interface DroppedOption {
  facet: string;
  value: string;
}

export function dropUnselectableOptions(facetSet: FacetSet): { facetSet: FacetSet; dropped: DroppedOption[] } {
  const dropped: DroppedOption[] = [];

  const facets = facetSet.facets.map((facet) => {
    if (!facet.options) return facet;
    const kept = sanitizeFilterState({ ...NO_FILTERS, [facet.id]: facet.options.map((o) => o.value) })[facet.id];
    const keptValues = new Set((Array.isArray(kept) ? kept : []).map((v) => String(v).toLowerCase()));
    const options = facet.options.filter((o) => {
      const selectable = keptValues.has(o.value.toLowerCase());
      if (!selectable) dropped.push({ facet: facet.id, value: o.value });
      return selectable;
    });
    return options.length === facet.options.length ? facet : { ...facet, options };
  });

  return { facetSet: { ...facetSet, facets }, dropped };
}
