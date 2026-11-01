import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import type { OptionMapSource } from '@/features/product-filtering/core/ports';
import { CATALOGUE_FETCH_CACHE } from './catalogueCache';
import { OPTION_MAP_QUERY, toOptionMapData } from './optionMapData';

/**
 * Read what the option maps are computed from, served from the same Data Cache entry rules as the shop's facet read
 * (see catalogueCache.ts), so the Studio list matches what the shop will show. Throws on a failed fetch.
 */
export const fetchOptionMapData: OptionMapSource = async () =>
  toOptionMapData(await sanityFetch<unknown>({ query: OPTION_MAP_QUERY, next: CATALOGUE_FETCH_CACHE }));
