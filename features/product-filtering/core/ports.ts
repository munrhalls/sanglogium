// The function types queries/ and server.ts need from adapters/. Implemented
// by adapters/sanity/; declared here so the use cases stay system-agnostic.

import type { RawProduct } from './types/filterTypes';

/** Fetch the facet-relevant product projection for a route's VFS key set. */
export type FacetSource = (options: { keys: string[] }) => Promise<RawProduct[]>;
