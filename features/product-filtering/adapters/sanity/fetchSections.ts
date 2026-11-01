import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import type { SectionSource } from '@/features/product-filtering/core/ports';
import { CATALOGUE_FETCH_CACHE } from './catalogueCache';
import { SECTION_QUERY, toSectionData } from './sectionData';

/**
 * Read what the sections are computed from, served from the same Data Cache entry rules as the route read (see catalogueCache.ts).
 * Throws on a failed fetch: the use case decides what a failure means.
 */
export const fetchSections: SectionSource = async () => toSectionData(await sanityFetch<unknown>({ query: SECTION_QUERY, next: CATALOGUE_FETCH_CACHE }));
