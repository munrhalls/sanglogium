// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions. Never re-export server-only or Sanity code here. Explicit named re-exports only; never bare export *.
export type { HeroData, FeaturedProduct, SpotlightProduct, SpotlightData, IemProduct, NewestReleaseData, DacProduct, AccessoryProduct, AccessoryData, HomepageData } from './domain/homepageTypes';
export { HOME_12 } from './config/homeIems';
export { default as Hero } from './ui/hero/Hero';
export { default as TrustBar } from './ui/trust-bar/TrustBar';
export { default as Featured, FeaturedCard } from './ui/featured/Featured';
export { default as ProductSpotlight1 } from './ui/product-spotlight-1/ProductSpotlight1';
export { default as ProductSpotlight2 } from './ui/product-spotlight-2/ProductSpotlight2';
export { default as ProductSpotlight3 } from './ui/product-spotlight-3/ProductSpotlight3';
