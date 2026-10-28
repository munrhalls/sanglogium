// TEMPORARY. Not part of the picklist chunk. It holds what the sidebar and the
// search redirect still need and the picklist does not provide: brand and in
// stock (fixed in code, not picklist fields), the two groups, and the
// wearingStyle query-only entry. Delete this file when the later chunks
// (drawing and labelling the controls, the search redirect) own these.

import type {
  FacetGroup,
  QueryOnlyFacet,
  RenderedFacet,
} from '@/features/product-filtering/core/types/facetProjection';

export const COMMERCIAL_GROUP: FacetGroup = { id: 'commercial', label: '' };

export const MORE_GROUP: FacetGroup = { id: 'more', label: 'More filters' };

/** Brand and in stock are the same in every slice and carry their control here: no stored field decides them.
 *  Brand has no option list, its names are counted from the products (brandRef.name). In stock is computed from the stock fields. */
export const COMMERCIAL_FACETS: RenderedFacet[] = [
  { id: 'brand', attribute: 'brand', label: 'Brand', group: 'commercial', control: 'checkbox' },
  { id: 'inStock', attribute: 'inStock', label: 'In Stock Only', group: 'commercial', control: 'boolean' },
];

export const QUERY_ONLY_FACETS: QueryOnlyFacet[] = [
  { id: 'wearingStyle', attribute: 'wearingStyle' },
];
