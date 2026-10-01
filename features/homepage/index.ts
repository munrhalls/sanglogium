// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions. Never re-export server-only or Sanity code here. Explicit named re-exports only; never bare export *.
export type { HeroData, FeaturedProduct, SpotlightProduct, SpotlightData, IemProduct, NewestReleaseData, DacProduct, AccessoryProduct, AccessoryData, HomepageData } from './domain/homepageTypes';
export { HOME_12 } from './config/homeIems';
