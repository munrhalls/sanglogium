import { cache } from "react";
import { fetchHomepageDataBatched, HomepageData } from "./homepageBatch";

/**
 * Cached wrapper for homepage data fetching.
 * Uses React.cache() to deduplicate requests within a single render pass.
 * Multiple components can call this—only 1 network request will be made.
 */
export const cachedFetchHomepageData = cache(async (): Promise<HomepageData> => {
  return fetchHomepageDataBatched();
});

// Re-export types for convenience
export type { HomepageData } from "./homepageBatch";
