import "server-only";

import { fetchHeroData, fetchHomepageSections } from './adapters/sanity/getHomepageData';
import { fetchIemProductsBySlugs } from './adapters/sanity/getIemProductsBySlugs';
import { getHomepage as getHomepageQuery, getHomepageIems } from './queries/getHomepage';
import type { HomepageSource } from './core/ports';
import type { HomepageData, IemProduct } from './core/rules/homepageTypes';

const homepageSource: HomepageSource = {
  fetchHeroData,
  fetchHomepageSections,
  fetchIemProductsBySlugs,
};

export function getHomepage(): Promise<HomepageData> {
  return getHomepageQuery(homepageSource);
}

export function getIemProductsBySlugs(slugs: string[]): Promise<IemProduct[]> {
  return getHomepageIems(homepageSource, slugs);
}

export { default as HomepageView } from './view/HomepageView';
export { default as HeroView } from './view/hero/HeroView';
export { default as FeaturedView, FeaturedCard } from './view/featured/FeaturedView';
export { default as ProductSpotlightMediaLeftView } from './view/product-spotlight-media-left/ProductSpotlightMediaLeftView';
export { default as ProductSpotlightMediaRightView } from './view/product-spotlight-media-right/ProductSpotlightMediaRightView';
export { default as NewestReleaseView } from './view/newest-release/NewestReleaseView';
export { default as DacsView } from './view/dacs/DacsView';
export { default as AccessoriesView } from './view/accessories/AccessoriesView';
