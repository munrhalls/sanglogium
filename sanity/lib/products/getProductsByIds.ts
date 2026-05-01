import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';
import { Product } from './getProductBySlug';

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const products = await sanityFetch<Product[]>({
    query: groq`*[_type == "product" && _id in $ids && defined(stripePriceId)] {
      _id,
      name,
      brand->{ _id, name, slug },
      displayPrice,
      stock,
      reservedStock,
      sku,
      stripePriceId,
      image,
      gallery,
      slug {
        current
      },
      description,
      overviewFields[] {
        title,
        value,
        information
      },
      specifications[] {
        title,
        value,
        information
      },
      catalogueLocationKeys
    }`,
    params: { ids }
  });

  return products || [];
}
