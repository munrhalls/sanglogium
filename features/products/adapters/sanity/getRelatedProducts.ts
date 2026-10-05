import "server-only";
import { sanityFetch } from '@/platform/db/client';
import groq from 'groq';
import type { RelatedProduct } from '@/features/products/core/rules/productTypes';

export async function getRelatedProducts(
  currentId: string,
  catalogueKeys: string[],
  limit: number = 6
): Promise<RelatedProduct[]> {
  if (!catalogueKeys || catalogueKeys.length === 0) {
    return [];
  }

  const products = await sanityFetch<RelatedProduct[]>({
    query: groq`*[_type == "product"
      && _id != $currentId
      && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
    ] | order(price_data.unit_amount asc) [0...$limit] {
      _id,
      name,
      brand {
        _id,
        name
      },
      price_data,
      image,
      slug {
        current
      }
    }`,
    params: { currentId, catalogueKeys, limit }
  });

  return products || [];
}
