import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface NewestReleaseProduct {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery: Array<{ asset: { _id: string; url: string }; alt?: string }>;
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
    _id, name, brand->{ _id, name, slug }, price_data,
    image{asset->{_id, url}},
    gallery[]{asset->{_id, url}}
  }
}`;

export const getNewestRelease = cache(async (): Promise<NewestReleaseData | null> => {
  return sanityFetch({ query: NEWEST_RELEASE_QUERY });
});
