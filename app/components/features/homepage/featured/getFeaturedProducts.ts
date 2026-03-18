import { sanityFetch } from "@/sanity/lib/client";

export interface FeaturedProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  image: {
    asset: {
      url: string;
    };
    alt?: string;
  };
}

const FEATURED_QUERY = `*[_type == "product" &&
  "featured" in catalogueLocationKeys]{
  _id,
  name,
  brand,
  displayPrice,
  image{asset->{url}}
}`;

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  return sanityFetch({ query: FEATURED_QUERY });
}
