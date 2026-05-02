import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";

export interface FeaturedProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  stock: number;
  slug: string;
  productPromo: string;
  image: {
    asset: {
      url: string;
    };
    alt?: string;
  };
}

const FEATURED_QUERY = `*[_type == "homepageData"][0].featuredProducts[]{
  productPromo,
  ...productRef->{
    _id,
    name,
    brand->{ _id, name, slug },
    price_data,
    stock,
    "slug": slug.current,
    image{asset->{url}}
  }
}`;

export const getFeaturedProducts = cache(async (): Promise<FeaturedProduct[]> => {
  return sanityFetch({ query: FEATURED_QUERY });
});