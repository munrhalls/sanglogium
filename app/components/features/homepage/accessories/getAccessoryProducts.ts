import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";

export interface AccessoryProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  imageUrl: string;
  image: { asset: { url: string }; alt?: string };
}

export interface AccessoryData {
  cables: AccessoryProduct[];
  earpads: AccessoryProduct[];
}

const BASE = `*[_type == "homepageData"][0]`;

const CABLES_Q = `${BASE}.accessoriesCables[]->{_id,name,brand,displayPrice,"imageUrl": image.asset->url,image{asset->{url}}}`;
const EARPADS_Q = `${BASE}.accessoriesEarpads[]->{_id,name,brand,displayPrice,"imageUrl": image.asset->url,image{asset->{url}}}`;

export const getAccessoryProducts = cache(async (): Promise<AccessoryData> => {
  const [cables, earpads] = await Promise.all([
    sanityFetch({ query: CABLES_Q }),
    sanityFetch({ query: EARPADS_Q }),
  ]);
  return {
    cables: (cables as AccessoryProduct[]) ?? [],
    earpads: (earpads as AccessoryProduct[]) ?? [],
  };
});
