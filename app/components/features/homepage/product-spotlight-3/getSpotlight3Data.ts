import { sanityFetch } from "@/sanity/lib/client";
import type { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";

const SPOTLIGHT3_QUERY = `*[_type == "homepageData"][0].spotlight3Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand, displayPrice,
    image{asset->{url}},
    gallery[]{asset->{url}}
  }
}`;

export async function getSpotlight3Data(): Promise<Spotlight1Data | null> {
  return sanityFetch({ query: SPOTLIGHT3_QUERY });
}
