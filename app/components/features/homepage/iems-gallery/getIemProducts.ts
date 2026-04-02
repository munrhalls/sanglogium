import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";

export interface IemProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  displayPrice: number;
  slug: string;
  imageUrl: string;
  image: { asset: { url: string }; alt?: string };
}

const IEMS_QUERY = `*[_type == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  brand->{ _id, name, slug },
  displayPrice,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image{asset->{url}}
}`;

export const getIemProducts = cache(async (): Promise<IemProduct[]> => {
  const result = await sanityFetch({ query: IEMS_QUERY }) as IemProduct[];
  return result ?? [];
});
