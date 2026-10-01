// ============================================================================
// Type Definitions - Exact matches to existing interfaces for zero-breaking
// ============================================================================

export interface HeroData {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink?: string;
  backgroundImage: {
    asset: {
      _id: string;
      url: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
          aspectRatio: number;
        };
        lqip: string;
      };
    };
    hotspot?: {
      x: number;
      y: number;
    };
    crop?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    alt?: string;
  };
  mobileBackgroundImage: {
    asset: {
      _id: string;
      url: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
          aspectRatio: number;
        };
        lqip: string;
      };
    };
    hotspot?: {
      x: number;
      y: number;
    };
    crop?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    alt?: string;
  };
}

export interface FeaturedProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  productPromo: string;
  image: {
    asset: {
      _id: string;
      url: string;
    };
    alt?: string;
  };
}

export interface SpotlightProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
  images?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
}

export interface SpotlightData {
  promoTitle: string;
  promoSubtitle: string;
  promoText: string;
  productRef: SpotlightProduct;
}

export interface IemProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  slug: string;
  stock: number;
  imageUrl: string;
  image: { asset: { _id: string; url: string }; alt?: string };
}

export interface NewestReleaseProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery: Array<{ asset: { _id: string; url: string }; alt?: string }>;
  images?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
}

export interface NewestReleaseData {
  promoTitle: string;
  promoSubtitle: string;
  promoText: string;
  productRef: NewestReleaseProduct;
}

export interface DacProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  image: { asset: { _id: string; url: string }; alt?: string };
}

export interface AccessoryProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  imageUrl: string;
  image: { asset: { _id: string; url: string }; alt?: string };
}

export interface AccessoryData {
  cables: AccessoryProduct[];
  interconnects: AccessoryProduct[];
  adapters: AccessoryProduct[];
  earpads: AccessoryProduct[];
  eartips: AccessoryProduct[];
  careCleaning: AccessoryProduct[];
  storage: AccessoryProduct[];
}

export interface HomepageData {
  hero: HeroData | null;
  featured: FeaturedProduct[];
  spotlight1: SpotlightData | null;
  spotlight2: SpotlightData | null;
  spotlight3: SpotlightData | null;
  iemsGallery: IemProduct[];
  newestRelease: NewestReleaseData | null;
  dacs: DacProduct[];
  accessories: AccessoryData;
}
