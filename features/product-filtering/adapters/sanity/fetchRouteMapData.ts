import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import type { RouteMapSource } from '@/features/product-filtering/core/ports';
import { CATALOGUE_FETCH_CACHE } from './catalogueCache';
import { ROUTE_MAP_QUERY, toRouteMapData } from './routeMapData';

/**
 * Read what one route's controls are computed from, served from the same Data Cache entry rules as the shop's facet read (see catalogueCache.ts).
 * The route's key set goes in as the query's `$keys`. Throws on a failed fetch: the use case decides what a failure means.
 */
export const fetchRouteMapData: RouteMapSource = async ({ keys }) =>
  toRouteMapData(await sanityFetch<unknown>({ query: ROUTE_MAP_QUERY, params: { keys }, next: CATALOGUE_FETCH_CACHE }));
