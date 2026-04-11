import { sanityFetch } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";

// ============================================================================
// Type Definitions - Exact matches to existing interfaces for zero-breaking
// ============================================================================

export interface HeroData {
  headline: string;
  subheadline: string;
  ctaText: string;
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
  displayPrice: number;
  stock: number;
  slug: string;
  productPromo: string;
  image: {
    asset: {
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
  displayPrice: number;
  stock: number;
  slug: string;
  image: { asset: { url: string }; alt?: string };
  gallery?: Array<{ asset: { url: string }; alt?: string }>;
  images?: Array<{ asset: { url: string }; alt?: string }>;
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
  displayPrice: number;
  slug: string;
  stock: number;
  imageUrl: string;
  image: { asset: { url: string }; alt?: string };
}

export interface NewestReleaseProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  displayPrice: number;
  stock: number;
  slug: string;
  image: { asset: { url: string }; alt?: string };
  gallery: Array<{ asset: { url: string }; alt?: string }>;
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
  displayPrice: number;
  stock: number;
  slug: string;
  image: { asset: { url: string }; alt?: string };
}

export interface AccessoryProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  displayPrice: number;
  stock: number;
  slug: string;
  imageUrl: string;
  image: { asset: { url: string }; alt?: string };
}

export interface AccessoryData {
  cables: AccessoryProduct[];
  earpads: AccessoryProduct[];
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
        displayPrice,
        stock,
        stripePriceId,
        "slug": slug.current,
        image { asset->{url} }
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
        displayPrice,
        stock,
        stripePriceId,
        "slug": slug.current,
        image { asset->{url} },
        gallery[] { asset->{url} }
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
        displayPrice,
        stock,
        stripePriceId,
        "slug": slug.current,
        image { asset->{url} },
        gallery[] { asset->{url} }
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
        displayPrice,
        stock,
        stripePriceId,
        "slug": slug.current,
        image { asset->{url} },
        gallery[] { asset->{url} }
      }
    },

    // IEMs gallery section
    "iemsGallery": iemsGallery[]->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      stripePriceId,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{url} }
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
        displayPrice,
        stock,
        stripePriceId,
        "slug": slug.current,
        image { asset->{url} },
        gallery[] { asset->{url} }
      }
    },

    // DACs section
    "dacs": dacs[]->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      stripePriceId,
      "slug": slug.current,
      image { asset->{url} }
    },

    // Accessories - cables section
    "accessoriesCables": accessoriesCables[]->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      stripePriceId,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{url} }
    },

    // Accessories - earpads section
    "accessoriesEarpads": accessoriesEarpads[]->{
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      stripePriceId,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      image { asset->{url} }
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
  // NewestReleaseData already has gallery in productRef, matches expected shape
  return data;
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
    const rawData = await sanityFetch<{
      featured?: FeaturedProduct[];
      spotlight1?: SpotlightData;
      spotlight2?: SpotlightData;
      spotlight3?: SpotlightData;
      iemsGallery?: IemProduct[];
      newestRelease?: NewestReleaseData;
      dacs?: DacProduct[];
      accessoriesCables?: AccessoryProduct[];
      accessoriesEarpads?: AccessoryProduct[];
    }>({ query: HOMEPAGE_DATA_QUERY });

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
        accessories: { cables: [], earpads: [] }
      };
    }

    // Process spotlights to merge gallery into images
    const spotlight1 = processSpotlightData(rawData.spotlight1 ?? null);
    const spotlight2 = processSpotlightData(rawData.spotlight2 ?? null);
    const spotlight3 = processSpotlightData(rawData.spotlight3 ?? null);
    const newestRelease = processNewestReleaseData(rawData.newestRelease ?? null);

    // Ensure accessories structure
    const accessories: AccessoryData = {
      cables: rawData.accessoriesCables ?? [],
      earpads: rawData.accessoriesEarpads ?? []
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
      accessories: { cables: [], earpads: [] }
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
      accessories: { cables: [], earpads: [] }
    };
  }
}
