import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface IemProduct {
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
  imageUrl: string;
  image: { asset: { _id: string; url: string }; alt?: string };
}

const IEMS_QUERY = `*[_type == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  brand->{ _id, name, slug },
  price_data,
  stock,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image{asset->{_id, url}}
}`;

export const getIemProducts = cache(async (): Promise<IemProduct[]> => {
  const result = await sanityFetch({ query: IEMS_QUERY }) as IemProduct[];
  return result ?? [];
});
