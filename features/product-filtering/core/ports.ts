// The function types queries/ and server.ts need from adapters/. Implemented
// by adapters/sanity/; declared here so the use cases stay system-agnostic.

import type { RawProduct, ProductQueryState, FilterQuery } from './types/filterTypes';
import type { Picklist } from './types/picklist';
import type { FacetSet } from './types/facetProjection';

/** Fetch the facet-relevant product projection for a route's VFS key set. */
export type FacetSource = (options: { keys: string[] }) => Promise<RawProduct[]>;

/** Fetch the owner's picklist: per category, the facet paths to read. */
export type PicklistSource = () => Promise<Picklist>;

/** Reads the URL state; with a facet set it also reads that set's own keys, without one only sort, price, in stock and brand. */
export type LoadFilterState = (query: FilterQuery, facetSet?: FacetSet) => ProductQueryState;

export interface FacetPorts {
  fetchProducts: FacetSource;
  fetchPicklist: PicklistSource;
  loadState: LoadFilterState;
}
