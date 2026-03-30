import { sanityFetch } from '@/sanity/lib/client';
import groq from 'groq';

export interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string };
  displayPrice: number;
  image: any;
  images?: any[];
  slug: { current: string };
  description?: string;
  catalogueLocationKeys: string[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await sanityFetch({
    query: groq`*[_type == "product" && slug.current == $slug] {
      _id,
      name,
      brand {
        _id,
        name
      },
      displayPrice,
      image,
      images,
      slug {
        current
      },
      description,
      catalogueLocationKeys
    }`,
    params: { slug }
  });
  
  return products[0] || null;
}
