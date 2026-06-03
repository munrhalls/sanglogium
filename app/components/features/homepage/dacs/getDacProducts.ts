import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface DacProduct {
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

const DACS_QUERY = `*[_type == "homepageData"][0].dacs[]->{
  _id, name, brand->{ _id, name, slug }, price_data, stock,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image{asset->{_id, url}}
}`;

export const getDacProducts = cache(async (): Promise<DacProduct[]> => {
  const result = await sanityFetch({ query: DACS_QUERY }) as DacProduct[];
  return result ?? [];
});
