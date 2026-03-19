import { sanityFetch } from "@/sanity/lib/client";
import type { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";

const SPOTLIGHT2_QUERY = `*[_type == "homepageData"][0].spotlight2Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand, displayPrice,
    image{asset->{url}}
  }
}`;

export async function getSpotlight2Data(): Promise<Spotlight1Data | null> {
  return sanityFetch({ query: SPOTLIGHT2_QUERY });
}
