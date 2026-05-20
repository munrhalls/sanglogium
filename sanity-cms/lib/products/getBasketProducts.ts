import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface BasketProduct {
  _id: string;
  name: string;
  price_data: {
    currency: string;
    unit_amount: number;
  };
  stock: number;
  reservedStock: number;
  image: any;
  parcel?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    distance_unit: string;
    mass_unit: string;
  };
}

export async function getBasketProducts(ids: string[]): Promise<BasketProduct[]> {
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
