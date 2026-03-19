import { sanityFetch } from "@/sanity/lib/client";

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
  storage: AccessoryProduct[];
}

const BASE = `*[_type == "homepageData"][0]`;

const CABLES_Q = `${BASE}.accessoriesCables[]->{_id,name,brand,displayPrice,"imageUrl": image.asset->url,image{asset->{url}}}`;
const EARPADS_Q = `${BASE}.accessoriesEarpads[]->{_id,name,brand,displayPrice,"imageUrl": image.asset->url,image{asset->{url}}}`;
const STORAGE_Q = `${BASE}.accessoriesStorage[]->{_id,name,brand,displayPrice,"imageUrl": image.asset->url,image{asset->{url}}}`;

export async function getAccessoryProducts(): Promise<AccessoryData> {
  const [cables, earpads, storage] = await Promise.all([
    sanityFetch({ query: CABLES_Q }),
    sanityFetch({ query: EARPADS_Q }),
    sanityFetch({ query: STORAGE_Q }),
  ]);
  return {
    cables: (cables as AccessoryProduct[]) ?? [],
    earpads: (earpads as AccessoryProduct[]) ?? [],
    storage: (storage as AccessoryProduct[]) ?? [],
  };
}
