import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";

export interface NewestReleaseProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  image: { asset: { url: string }; alt?: string };
  gallery: Array<{ asset: { url: string }; alt?: string }>;
}

export interface NewestReleaseData {
  promoTitle: string;
  promoSubtitle: string;
  promoText: string;
  productRef: NewestReleaseProduct;
}



const NEWEST_RELEASE_QUERY = `*[_type == "homepageData"][0].newestReleaseData{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand, displayPrice,
    image{asset->{url}},
    gallery[]{asset->{url}}
  }
}`;

export const getNewestRelease = cache(async (): Promise<NewestReleaseData | null> => {
  return sanityFetch({ query: NEWEST_RELEASE_QUERY });
});
