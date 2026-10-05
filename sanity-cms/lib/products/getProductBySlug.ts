import { cache } from 'react';
import { sanityFetch } from '@/platform/db/client';
import groq from 'groq';
import type { ProductDetailData as Product } from '@/features/products';

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const products = await sanityFetch<Product[]>({
    query: groq`*[_type == "product" && slug.current == $slug] {
      _id,
      name,
      brand->{ _id, name, slug },
      price_data,
      stock,
      sku,
      image,
      gallery,
      slug {
        current
      },
      description,
      overviewFields[] {
        _key,
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
    params: { slug }
  });

  return (products as Product[])[0] || null;
});
