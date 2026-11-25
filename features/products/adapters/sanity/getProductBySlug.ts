import "server-only";
import { cache } from 'react';
import { sanityFetch } from '@/platform/sanity/client';
import { CATALOGUE_FETCH_CACHE } from '@/features/product-filtering/server';
import groq from 'groq';
import type { ProductDetailData as Product } from '@/features/products/core/types/productTypes';

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
    params: { slug },
    next: CATALOGUE_FETCH_CACHE
  });

  return (products as Product[])[0] || null;
});
