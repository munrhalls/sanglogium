import "server-only";
import { sanityFetch } from '@/platform/sanity/client';
import { groq } from 'next-sanity';
import type { PicklistSource } from '@/features/product-filtering/core/ports';
import { CATALOGUE_FETCH_CACHE } from './catalogueCache';

/**
 * Read the picklist document (_id "filterPicklist"): per category, the owner's
 * chosen filterAttributes paths. Throws on a failed fetch — the caller decides
 * what a failure means; a missing document yields three empty lists.
 */
export const fetchPicklist: PicklistSource = async () => {
  const query = groq`*[_id == "filterPicklist"][0]{ headphones, audioElectronics, accessories }`;
  const doc = await sanityFetch<{ headphones?: unknown; audioElectronics?: unknown; accessories?: unknown } | null>({ query, next: CATALOGUE_FETCH_CACHE });
  const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);
  return { headphones: strings(doc?.headphones), 'audio-electronics': strings(doc?.audioElectronics), accessories: strings(doc?.accessories) };
};
