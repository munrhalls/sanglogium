import { sanityFetch } from "@/sanity/lib/client";

export interface FeaturedProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
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
    brand,
    displayPrice,
    image{asset->{url}}
  }
}`;

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  return sanityFetch({ query: FEATURED_QUERY });
}