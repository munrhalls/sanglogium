import { client } from '@/sanity-cms/lib/client';

export interface SitemapSlug {
  slug: string;
  _updatedAt?: string;
}

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
