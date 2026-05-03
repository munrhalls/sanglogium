import { sanityFetch } from '@/sanity-config/lib/client';
import groq from 'groq';

export interface BasketProduct {
  _id: string;
  price_data: {
    currency: string;
    unit_amount: number;
  };
  stock: number;
  reservedStock: number;
}

export async function getBasketProducts(ids: string[]): Promise<BasketProduct[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const products = await sanityFetch<BasketProduct[]>({
    query: groq`*[_type == "product" && _id in $ids && defined(stripePriceId)] {
      _id,
      price_data,
      stock,
      reservedStock
    }`,
    params: { ids }
  });

  return products || [];
}
