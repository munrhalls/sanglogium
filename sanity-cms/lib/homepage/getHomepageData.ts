import { sanityFetch } from "@/sanity-cms/lib/client";
import { defineQuery } from "next-sanity";
import { resolveSlugToId } from "@/data/catalogue";

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

// ============================================================================
// Unified GROQ Queries - Single batched request for all homepage data
// ============================================================================

/**
 * Unified query for all homepageData document sections.
 * Fetches: featured, spotlights, IEMs, newest release, DACs, accessories
 */
const HOMEPAGE_DATA_QUERY = defineQuery(`
  *[_type == "homepageData"][0] {
    // Featured products section
    "featured": featuredProducts[] {
      productPromo,
      ...productRef->{
        _id,
        name,
        brand->{ _id, name, slug },
        price_data,
        stock,
        "slug": slug.current,
        image { asset->{_id, url} }
      }
    },

    // Spotlight 1 section
    "spotlight1": spotlight1Data {
      promoTitle,
      promoSubtitle,
      promoText,
      productRef->{
        _id,
        name,
        brand->{ _id, name, slug },
        price_data,
        stock,
        "slug": slug.current,
        image { asset->{_id, url} },
        gallery[] { asset->{_id, url} }
      }
    },

    // Spotlight 2 section
    "spotlight2": spotlight2Data {
      promoTitle,
      promoSubtitle,
      promoText,
      productRef->{
        _id,
        name,
        brand->{ _id, name, slug },
        price_data,
        stock,
        "slug": slug.current,
        image { asset->{_id, url} },
        gallery[] { asset->{_id, url} }
      }
    },

    // Spotlight 3 section
    "spotlight3": spotlight3Data {
      promoTitle,
      promoSubtitle,
      promoText,
      productRef->{
        _id,
        name,
        brand->{ _id, name, slug },
        price_data,
        stock,
        "slug": slug.current,
        image { asset->{_id, url} },
        gallery[] { asset->{_id, url} }
      }
    },

    // IEMs gallery section
    "iemsGallery": iemsGallery[]->{
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Newest release section
    "newestRelease": newestReleaseData {
      promoTitle,
      promoSubtitle,
      promoText,
      productRef->{
        _id,
        name,
        brand->{ _id, name, slug },
        price_data,
        stock,
        "slug": slug.current,
        image { asset->{_id, url} },
        gallery[] { asset->{_id, url} }
      }
    },

    // DACs section
    "dacs": dacs[]->{
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Accessories - cables section
    "accessoriesCables": *[_type == "product" && $cablesId in catalogueLocationKeys] | order(_createdAt desc) {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Accessories - interconnects section
    "accessoriesInterconnects": *[_type == "product" && $interconnectsId in catalogueLocationKeys] | order(_createdAt desc) {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Accessories - adapters section
    "accessoriesAdapters": *[_type == "product" && $adaptersId in catalogueLocationKeys] | order(_createdAt desc) {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Accessories - earpads section
    "accessoriesEarpads": *[_type == "product" && $earpadsId in catalogueLocationKeys] | order(_createdAt desc) {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Accessories - eartips section
    "accessoriesEartips": *[_type == "product" && $eartipsId in catalogueLocationKeys] | order(_createdAt desc) {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Accessories - care & cleaning section
    "accessoriesCareCleaning": *[_type == "product" && $careCleaningId in catalogueLocationKeys] | order(_createdAt desc) {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    },

    // Accessories - storage section (2 slot IDs: stands + cases, combined)
    "accessoriesStorage": *[_type == "product" && ($storageStandsId in catalogueLocationKeys || $carryingCasesId in catalogueLocationKeys)] | order(_createdAt desc) {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{_id, url} }
    }
  }
`);

/**
 * Separate query for hero document (different document type)
 */
const HERO_QUERY = defineQuery(`
  *[_type == "hero"] | order(_updatedAt desc)[0] {
    headline,
    subheadline,
    ctaText,
    ctaLink,
    backgroundImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions,
          lqip
        }
      },
      hotspot,
      crop,
      alt
    },
    mobileBackgroundImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions,
          lqip
        }
      },
      hotspot,
      crop,
      alt
    }
  }
`);

// ============================================================================
// Data Processing Functions - Transform raw GROQ output to expected shapes
// ============================================================================

/**
 * Process spotlight product to merge gallery into images array.
 * Matches existing processProductImages behavior.
 */
function processSpotlightProduct(product: SpotlightProduct | null): SpotlightProduct | null {
  if (!product || !product.image) return product;

  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return { ...product, images };
}

/**
 * Process spotlight data to transform productRef with merged images.
 */
function processSpotlightData(data: SpotlightData | null): SpotlightData | null {
  if (!data || !data.productRef) return data;

  return {
    ...data,
    productRef: processSpotlightProduct(data.productRef) as SpotlightProduct
  };
}

/**
 * Process newest release data to transform productRef with merged images.
 * Note: NewestRelease uses gallery field directly, no merge needed for product shape.
 */
function processNewestReleaseData(data: NewestReleaseData | null): NewestReleaseData | null {
  if (!data || !data.productRef) return data;

  const product = data.productRef;
  if (!product.image) return data;

  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return {
    ...data,
    productRef: { ...product, images }
  };
}

// ============================================================================
// Main Fetch Functions - Batched data fetching with error handling
// ============================================================================

/**
 * Fetch hero data from hero document.
 * Separate query because hero is a different document type.
 */
async function fetchHeroData(): Promise<HeroData | null> {
  try {
    const heroData = await sanityFetch<HeroData>({ query: HERO_QUERY });
    return heroData || null;
  } catch (error) {
    console.error("[homepageBatch] Error fetching hero data:", error);
    return null;
  }
}

/**
 * Fetch all homepage data sections in a single batched query.
 * Replaces 8 separate API calls with 1 request.
 */
async function fetchHomepageSections(): Promise<{
  featured: FeaturedProduct[];
  spotlight1: SpotlightData | null;
  spotlight2: SpotlightData | null;
  spotlight3: SpotlightData | null;
  iemsGallery: IemProduct[];
  newestRelease: NewestReleaseData | null;
  dacs: DacProduct[];
  accessories: AccessoryData;
}> {
  try {
    const slotIds = {
      cablesId: resolveSlugToId("headphone-cables"),
      interconnectsId: resolveSlugToId("interconnects"),
      adaptersId: resolveSlugToId("adapters"),
      earpadsId: resolveSlugToId("earpads"),
      eartipsId: resolveSlugToId("eartips"),
      careCleaningId: resolveSlugToId("care-cleaning"),
      storageStandsId: resolveSlugToId("headphone-stands"),
      carryingCasesId: resolveSlugToId("carrying-cases"),
    };

    const missingSlot = Object.entries(slotIds).find(([, id]) => id === undefined);
    if (missingSlot) {
      throw new Error(`resolveSlugToId returned undefined for accessory slot param "${missingSlot[0]}" — check data/catalogue-index.json`);
    }

    const rawData = await sanityFetch<{
      featured?: FeaturedProduct[];
      spotlight1?: SpotlightData;
      spotlight2?: SpotlightData;
      spotlight3?: SpotlightData;
      iemsGallery?: IemProduct[];
      newestRelease?: NewestReleaseData;
      dacs?: DacProduct[];
      accessoriesCables?: AccessoryProduct[];
      accessoriesInterconnects?: AccessoryProduct[];
      accessoriesAdapters?: AccessoryProduct[];
      accessoriesEarpads?: AccessoryProduct[];
      accessoriesEartips?: AccessoryProduct[];
      accessoriesCareCleaning?: AccessoryProduct[];
      accessoriesStorage?: AccessoryProduct[];
    }>({ query: HOMEPAGE_DATA_QUERY, params: slotIds });

    if (!rawData) {
      console.warn("[homepageBatch] No homepageData document found");
      return {
        featured: [],
        spotlight1: null,
        spotlight2: null,
        spotlight3: null,
        iemsGallery: [],
        newestRelease: null,
        dacs: [],
        accessories: {
          cables: [],
          interconnects: [],
          adapters: [],
          earpads: [],
          eartips: [],
          careCleaning: [],
          storage: []
        }
      };
    }

    // Process spotlights to merge gallery into images
    const spotlight1 = processSpotlightData(rawData.spotlight1 ?? null);
    const spotlight2 = processSpotlightData(rawData.spotlight2 ?? null);
    const spotlight3 = processSpotlightData(rawData.spotlight3 ?? null);
    const newestRelease = processNewestReleaseData(rawData.newestRelease ?? null);
    const accessories: AccessoryData = {
      cables: rawData.accessoriesCables ?? [],
      interconnects: rawData.accessoriesInterconnects ?? [],
      adapters: rawData.accessoriesAdapters ?? [],
      earpads: rawData.accessoriesEarpads ?? [],
      eartips: rawData.accessoriesEartips ?? [],
      careCleaning: rawData.accessoriesCareCleaning ?? [],
      storage: rawData.accessoriesStorage ?? []
    };

    return {
      featured: rawData.featured ?? [],
      spotlight1,
      spotlight2,
      spotlight3,
      iemsGallery: rawData.iemsGallery ?? [],
      newestRelease,
      dacs: rawData.dacs ?? [],
      accessories
    };
  } catch (error) {
    console.error("[homepageBatch] Error fetching homepage sections:", error);
    // Return empty structure to prevent page crashes
    return {
      featured: [],
      spotlight1: null,
      spotlight2: null,
      spotlight3: null,
      iemsGallery: [],
      newestRelease: null,
      dacs: [],
      accessories: {
        cables: [],
        interconnects: [],
        adapters: [],
        earpads: [],
        eartips: [],
        careCleaning: [],
        storage: []
      }
    };
  }
}

/**
 * Fetch all homepage data in 2 batched requests (down from 10).
 * Returns data in exact shape expected by HomepageData interface.
 */
export async function fetchHomepageDataBatched(): Promise<HomepageData> {
  console.time("Homepage Data Fetch (Batched)");

  try {
    // Parallel fetch of hero (separate doc type) and homepage sections (single batched query)
    const [hero, sections] = await Promise.all([
      fetchHeroData(),
      fetchHomepageSections()
    ]);

    console.timeEnd("Homepage Data Fetch (Batched)");

    return {
      hero,
      ...sections
    };
  } catch (error) {
    console.error("[homepageBatch] Error in batched fetch:", error);
    console.timeEnd("Homepage Data Fetch (Batched)");

    // Return empty data structure to prevent page crashes
    return {
      hero: null,
      featured: [],
      spotlight1: null,
      spotlight2: null,
      spotlight3: null,
      iemsGallery: [],
      newestRelease: null,
      dacs: [],
      accessories: {
        cables: [],
        interconnects: [],
        adapters: [],
        earpads: [],
        eartips: [],
        careCleaning: [],
        storage: []
      }
    };
  }
}
