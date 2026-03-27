import { getHeroData } from "@/sanity/lib/hero/getHeroData";
import { getFeaturedProducts } from "@/app/components/features/homepage/featured/getFeaturedProducts";
import { getSpotlight1Data } from "@/app/components/features/homepage/product-spotlight-1/getSpotlight1Data";
import { getSpotlight2Data } from "@/app/components/features/homepage/product-spotlight-2/getSpotlight2Data";
import { getSpotlight3Data } from "@/app/components/features/homepage/product-spotlight-3/getSpotlight3Data";
import { getIemProducts } from "@/app/components/features/homepage/iems-gallery/getIemProducts";
import { getNewestRelease } from "@/app/components/features/homepage/newest-release/getNewestRelease";
import { getDacProducts } from "@/app/components/features/homepage/dacs/getDacProducts";
import { getAccessoryProducts } from "@/app/components/features/homepage/accessories/getAccessoryProducts";

export interface HomepageData {
  hero: Awaited<ReturnType<typeof getHeroData>>;
  featured: Awaited<ReturnType<typeof getFeaturedProducts>>;
  spotlight1: Awaited<ReturnType<typeof getSpotlight1Data>>;
  spotlight2: Awaited<ReturnType<typeof getSpotlight2Data>>;
  spotlight3: Awaited<ReturnType<typeof getSpotlight3Data>>;
  iemsGallery: Awaited<ReturnType<typeof getIemProducts>>;
  newestRelease: Awaited<ReturnType<typeof getNewestRelease>>;
  dacs: Awaited<ReturnType<typeof getDacProducts>>;
  accessories: Awaited<ReturnType<typeof getAccessoryProducts>>;
}

export async function fetchHomepageData(): Promise<HomepageData> {
  console.time('Homepage Data Fetch');
  
  try {
    // Parallel fetch all homepage data
    const [
      hero,
      featured,
      spotlight1,
      spotlight2,
      spotlight3,
      iemsGallery,
      newestRelease,
      dacs,
      accessories
    ] = await Promise.all([
      getHeroData(),
      getFeaturedProducts(),
      getSpotlight1Data(),
      getSpotlight2Data(),
      getSpotlight3Data(),
      getIemProducts(),
      getNewestRelease(),
      getDacProducts(),
      getAccessoryProducts()
    ]);

    console.timeEnd('Homepage Data Fetch');

    return {
      hero,
      featured,
      spotlight1,
      spotlight2,
      spotlight3,
      iemsGallery,
      newestRelease,
      dacs,
      accessories
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    console.timeEnd('Homepage Data Fetch');
    
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
