import "server-only";

import { fetchHeroData } from './adapters/sanity/fetchHeroData';
import { fetchHomepageSections } from './adapters/sanity/fetchHomepageSections';
import { fetchIemProductsBySlugs } from './adapters/sanity/fetchIemProductsBySlugs';
import { resolveSlugToId } from '@/features/catalogue/server';
import { getHomepage as getHomepageQuery, getHomepageIems } from './queries/getHomepage';
import type { HomepageSource } from './core/ports';
import type { HomepageData, IemProduct } from './core/types/homepageTypes';

const homepageSource: HomepageSource = {
  fetchHeroData,
  fetchHomepageSections,
  fetchIemProductsBySlugs,
  resolveSlugToId,
};

export function getHomepage(): Promise<HomepageData> {
  return getHomepageQuery(homepageSource);
}

export function getIemProductsBySlugs(slugs: string[]): Promise<IemProduct[]> {
  return getHomepageIems(homepageSource, slugs);
}

export { default as HomepageView } from './view/HomepageView';
