import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { Product } from './getProductBySlug';

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const products = await sanityFetch<Product[]>({
    query: groq`*[_type == "product" && _id in $ids] {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      reservedStock,
      sku,
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
      catalogueLocationKeys,
      parcel {
        length,
        width,
        height,
        weight
      }
    }`,
    params: { ids }
  });

  return products || [];
}
