import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";

export interface DacProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  image: { asset: { url: string }; alt?: string };
}

const DACS_QUERY = `*[_type == "homepageData"][0].dacs[]->{
  _id, name, brand, displayPrice,
  image{asset->{url}}
}`;

export const getDacProducts = cache(async (): Promise<DacProduct[]> => {
  const result = await sanityFetch({ query: DACS_QUERY }) as DacProduct[];
  return result ?? [];
});
