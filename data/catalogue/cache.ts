import { unstable_cache } from 'next/cache';
import { getCatalogueForNavigation, resolveSlugToId, unrollDescendantKeys } from '../catalogue';
import { getCategoryMetadata } from '@/sanity/lib/products';

/**
 * Cached catalogue navigation data.
 *
 * Revalidation: 24 hours (86400 seconds)
 * Tags: ['catalogue']
 *
 * The catalogue is rebuilt daily via cron job, so 24h cache is appropriate.
 * Call revalidateTag('catalogue') after catalogue rebuild to refresh.
 */
export const getCachedCatalogue = unstable_cache(
  async () => getCatalogueForNavigation(),
  ['catalogue'],
  {
    revalidate: 86400,  // 24 hours
    tags: ['catalogue']
  }
);

/**
 * Cached category metadata lookup.
 *
 * Revalidation: 1 hour (3600 seconds)
 * Tags: ['category-metadata', 'category-metadata-${nodeId}']
 *
 * Category metadata changes infrequently (name, description, etc).
 * Individual tag allows per-category invalidation if needed.
 */
export const getCachedCategoryMetadata = unstable_cache(
  async (nodeId: string) => getCategoryMetadata(nodeId),
  ['category-metadata'],
  {
    revalidate: 3600,  // 1 hour
    tags: ['category-metadata']
  }
);

/**
 * Cached slug-to-ID resolution.
 *
 * Revalidation: 24 hours (86400 seconds)
 * Tags: ['catalogue-slugs']
 *
 * Slug mappings are static once catalogue is built.
 */
export const getCachedResolveSlugToId = unstable_cache(
  async (slug: string) => resolveSlugToId(slug),
  ['catalogue-slugs'],
  {
    revalidate: 86400,  // 24 hours
    tags: ['catalogue', 'catalogue-slugs']
  }
);

/**
 * Cached descendant key unrolling for VFS queries.
 *
 * Revalidation: 24 hours (86400 seconds)
 * Tags: ['catalogue-vfs', 'catalogue']
 *
 * Descendant computation is deterministic from catalogue structure.
 */
export const getCachedDescendantKeys = unstable_cache(
  async (nodeId: string) => unrollDescendantKeys(nodeId),
  ['catalogue-vfs'],
  {
    revalidate: 86400,  // 24 hours
    tags: ['catalogue', 'catalogue-vfs']
  }
);
