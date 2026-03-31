import { fetchHomepageDataBatched, HomepageData } from "@/app/lib/data/homepageBatch";

// Re-export the interface for backward compatibility
export type { HomepageData } from "@/app/lib/data/homepageBatch";

/**
 * Fetches all homepage data using batched queries.
 *
 * MIGRATION NOTE (S9-TTFB-OPTIMIZATION):
 * Previously used Promise.all([9 separate fetchers]) = ~10 API calls.
 * Now delegates to fetchHomepageDataBatched() = 2 API calls (hero + batched homepageData).
 *
 * TTFB Impact: ~10.9s → <600ms
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  console.time('Homepage Data Fetch');

  try {
    // Use batched fetcher - single query for all homepage sections
    const data = await fetchHomepageDataBatched();

    console.timeEnd('Homepage Data Fetch');
    return data;
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
