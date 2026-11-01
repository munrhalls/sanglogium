// The function types queries/ and server.ts need from adapters/. Implemented
// by adapters/sanity/; declared here so the use cases stay system-agnostic.

import type { RawProduct, ProductQueryState, FilterQuery } from './types/filterTypes';
import type { Picklist } from './types/picklist';
import type { FacetSet } from './types/facetProjection';
import type { OptionMapData, RouteMapData } from './types/optionMaps';
import type { SectionData } from './types/sections';

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

/** Fetch what the option maps are computed from: the stored picklist, the catalogue items and the published products. */
export type OptionMapSource = () => Promise<OptionMapData>;

export interface OptionMapPorts {
  fetchOptionMapData: OptionMapSource;
}

/** Fetch what one route's controls are computed from: the stored picklist, the curated rows and the published products on the route's VFS key set. */
export type RouteMapSource = (options: { keys: string[] }) => Promise<RouteMapData>;

export interface RouteMapPorts {
  fetchRouteMapData: RouteMapSource;
}

/** Fetch what the sections are computed from: the always-on fields, the picks and the heading rows of the picklist document. */
export type SectionSource = () => Promise<SectionData>;

export interface SectionPorts {
  fetchSections: SectionSource;
}
