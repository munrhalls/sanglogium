import { cache } from 'react';
import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  sku: string;
  image: any;
  gallery?: any[];
  slug: { current: string };
  description?: any;
  overviewFields?: { title: string; value: string; information?: string }[];
  specifications?: { title: string; value: string; information?: string }[];
  catalogueLocationKeys: string[];
}

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
