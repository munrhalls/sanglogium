// The function types queries/ and server.ts need from adapters/. Implemented
// by adapters/sanity/; declared here so the use cases stay system-agnostic.

import type { RawProduct } from './types/filterTypes';
import type { PriceRangeData } from './rules/priceBounds';

/** Fetch the facet-relevant product projection for a route's VFS key set. */
export type FacetSource = (options: { keys: string[] }) => Promise<RawProduct[]>;

/** Fetch the full-span min/max price (cents) for a route's VFS key set. */
export type PriceRangeSource = (options: {
  keys: string[];
}) => Promise<PriceRangeData | null>;
