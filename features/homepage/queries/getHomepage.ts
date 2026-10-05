import type { AccessoryData, HomepageData, IemProduct } from "@/features/homepage/core/rules/homepageTypes";
import type { HomepageSections, HomepageSource } from "@/features/homepage/core/ports";

function emptyAccessories(): AccessoryData {
  return {
    cables: [],
    interconnects: [],
    adapters: [],
    earpads: [],
    eartips: [],
    careCleaning: [],
    storage: []
  };
}

function emptySections(): HomepageSections {
  return {
    featured: [],
    spotlight1: null,
    spotlight2: null,
    spotlight3: null,
    iemsGallery: [],
    newestRelease: null,
    dacs: [],
    accessories: emptyAccessories()
  };
}

/**
 * Fetch all homepage data in 2 batched requests (down from 10).
 * Returns data in exact shape expected by HomepageData interface.
 */
export async function getHomepage(source: HomepageSource): Promise<HomepageData> {
  const startTime = performance.now();

  try {
    // Parallel fetch of hero (separate doc type) and homepage sections (single batched query)
    const [hero, sections] = await Promise.all([
      source.fetchHeroData().catch((error) => {
        console.error("[homepageBatch] Error fetching hero data:", error);
        return null;
      }),
      source.fetchHomepageSections()
        .then((s) => s ?? emptySections())
        .catch((error) => {
          console.error("[homepageBatch] Error fetching homepage sections:", error);
          // Return empty structure to prevent page crashes
          return emptySections();
        })
    ]);

    const duration = performance.now() - startTime;
    console.log(`[Homepage Data Fetch (Batched)] Completed in ${duration.toFixed(2)}ms`);

    return {
      hero,
      ...sections
    };
  } catch (error) {
    console.error("[homepageBatch] Error in batched fetch:", error);
    const duration = performance.now() - startTime;
    console.log(`[Homepage Data Fetch (Batched)] Failed after ${duration.toFixed(2)}ms`);

    // Return empty data structure to prevent page crashes
    return {
      hero: null,
      ...emptySections()
    };
  }
}

export async function getHomepageIems(source: HomepageSource, slugs: string[]): Promise<IemProduct[]> {
  if (!slugs.length) return [];

  const products = await source.fetchIemProductsBySlugs(slugs);

  const order = new Map(slugs.map((slug, idx) => [slug, idx]));

  return products
    .filter((p) => p.image?.asset?._id)
    .sort((a, b) => (order.get(a.slug) ?? Infinity) - (order.get(b.slug) ?? Infinity))
    .map((p) => ({
      ...p,
      brand: p.brand ?? { _id: "", name: "", slug: "" },
      price_data: p.price_data ?? { currency: "USD", unit_amount: 0 },
      stock: p.stock ?? 0,
      imageUrl: p.imageUrl ?? p.image?.asset?.url ?? "",
    }));
}
