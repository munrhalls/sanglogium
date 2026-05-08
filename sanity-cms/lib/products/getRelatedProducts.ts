import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface RelatedProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  slug: { current: string };
}

export async function getRelatedProducts(
  currentId: string,
  catalogueKeys: string[],
  limit: number = 6
): Promise<RelatedProduct[]> {
  if (!catalogueKeys || catalogueKeys.length === 0) {
    return [];
  }

  const products = await sanityFetch({
    query: groq`*[_type == "product"
      && _id != $currentId
      && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
      && defined(stripePriceId)
    ] | order(price_data.unit_amount asc) [0...$limit] {
      _id,
      name,
      brand {
        _id,
        name
      },
      price_data,
      stripePriceId,
      image,
      slug {
        current
      }
    }`,
    params: { currentId, catalogueKeys, limit }
  });

  return products || [];
}
