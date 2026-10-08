import { ACCESSORY_SLOT_SLUGS } from './definitions/accessorySlots';
import type { AccessoryData, DacProduct, FeaturedProduct, HeroData, IemProduct, NewestReleaseData, SpotlightData } from './types/homepageTypes';

export type AccessorySlotIds = Record<keyof typeof ACCESSORY_SLOT_SLUGS, string>;

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
  fetchHomepageSections(slotIds: AccessorySlotIds): Promise<HomepageSections | null>;
  fetchIemProductsBySlugs(slugs: string[]): Promise<IemProduct[]>;
  resolveSlugToId(slug: string): string | undefined;
}
