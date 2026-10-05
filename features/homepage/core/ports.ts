import type { AccessoryData, DacProduct, FeaturedProduct, HeroData, IemProduct, NewestReleaseData, SpotlightData } from './rules/homepageTypes';

export interface HomepageSections {
  featured: FeaturedProduct[];
  spotlight1: SpotlightData | null;
  spotlight2: SpotlightData | null;
  spotlight3: SpotlightData | null;
  iemsGallery: IemProduct[];
  newestRelease: NewestReleaseData | null;
  dacs: DacProduct[];
  accessories: AccessoryData;
}

export interface HomepageSource {
  fetchHeroData(): Promise<HeroData | null>;
  fetchHomepageSections(): Promise<HomepageSections | null>;
  fetchIemProductsBySlugs(slugs: string[]): Promise<IemProduct[]>;
}
