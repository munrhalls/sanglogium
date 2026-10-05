// Client-safe public entry. Routes, sanity-cms, layout and other features import ONLY from here, from ./server or from ./actions. Never re-export server-only or Sanity code here. Explicit named re-exports only; never bare export *.
export type { HeroData, FeaturedProduct, SpotlightProduct, SpotlightData, IemProduct, NewestReleaseData, DacProduct, AccessoryProduct, AccessoryData, HomepageData } from './core/rules/homepageTypes';
export { HOME_12 } from './core/definitions/homeIems';
export { default as TrustBar } from './ui/trust-bar/TrustBar';
export { default as ProductSpotlightFractal } from './ui/product-spotlight-fractal/ProductSpotlightFractal';
export { default as IemsGallery } from './ui/iems-gallery/IemsGallery';
export { default as IemCard } from './ui/iems-gallery/IemCard';
export { default as DacCard } from './ui/dacs/DacCard';
export { default as AccessoryCard } from './ui/accessories/AccessoryCard';
