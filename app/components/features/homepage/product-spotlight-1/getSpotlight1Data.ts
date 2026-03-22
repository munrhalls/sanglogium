import { sanityFetch } from "@/sanity/lib/client";

export interface Spotlight1Product {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  image: { asset: { url: string }; alt?: string };
  gallery?: Array<{ asset: { url: string }; alt?: string }>;
}

export interface Spotlight1Data {
  promoTitle: string;
  promoSubtitle: string;
  promoText: string;
  productRef: Spotlight1Product;
}

const SPOTLIGHT1_QUERY = `*[_type == "homepageData"][0].spotlight1Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand, displayPrice,
    image{asset->{url}},
    gallery[]{asset->{url}}
  }
}`;

export async function getSpotlight1Data(): Promise<Spotlight1Data | null> {
  return sanityFetch({ query: SPOTLIGHT1_QUERY });
}
