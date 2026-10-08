// Client door: the only entry other slices and routes use for this slice's client-safe code. Explicit named re-exports only.
export type { HeroData, FeaturedProduct, SpotlightProduct, SpotlightData, IemProduct, NewestReleaseData, DacProduct, AccessoryProduct, AccessoryData, HomepageData } from './core/types/homepageTypes';
export { HOME_12 } from './core/definitions/homeIems';
export { default as TrustBar } from './ui/TrustBar';
export { default as ProductSpotlightFractal } from './ui/ProductSpotlightFractal';
export { default as IemsGallery } from './ui/iems-gallery/IemsGallery';
export { default as IemCard } from './ui/iems-gallery/IemCard';
export { default as DacCard } from './ui/dacs/DacCard';
export { default as AccessoryCard } from './ui/accessories/AccessoryCard';
