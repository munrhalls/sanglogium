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

export { default as HomePage } from './view/HomePage';
export { default as Hero } from './view/hero/Hero';
export { default as Featured, FeaturedCard } from './view/featured/Featured';
export { default as ProductSpotlightMediaLeft } from './view/product-spotlight-media-left/ProductSpotlightMediaLeft';
export { default as ProductSpotlightMediaRight } from './view/product-spotlight-media-right/ProductSpotlightMediaRight';
export { default as NewestRelease } from './view/newest-release/NewestRelease';
export { default as Dacs } from './view/dacs/Dacs';
export { default as Accessories } from './view/accessories/Accessories';
