import "server-only";

import { sanityFetch } from '@/platform/sanity/client';
import type { BasketProduct } from '@/features/basket/core/types/basketTypes';
import groq from 'groq';

export async function fetchBasketProducts(ids: string[]): Promise<BasketProduct[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const products = await sanityFetch<BasketProduct[]>({
      query: groq`*[_type == "product" && _id in $ids && defined(price_data)] {
        _id,
        name,
        price_data,
        stock,
        reservedStock,
        image {
          asset {
            _ref
          }
        },
        parcel {
          length,
          width,
          height,
          weight,
          distance_unit,
          mass_unit
        }
      }`,
      params: { ids }
    });

    return products || [];
  } catch (error) {
    console.error('Failed to fetch basket products:', error);
    return [];
  }
}
