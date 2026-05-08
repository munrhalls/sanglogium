import { sanityFetch } from '@/sanity-config/lib/client';
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
