import "server-only";
import type { SitemapSlug } from '@/features/products/core/types/productDataTypes';
import { client } from '@/platform/sanity/client';

export async function getSitemapSlugs(): Promise<{
  products: SitemapSlug[];
  categories: SitemapSlug[];
}> {
  const [products, categories] = await Promise.all([
    client.fetch<SitemapSlug[]>(
      `*[_type == "product" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    ),
    client.fetch<SitemapSlug[]>(
      `*[_type == "category" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    ),
  ]);

  return { products, categories };
}
