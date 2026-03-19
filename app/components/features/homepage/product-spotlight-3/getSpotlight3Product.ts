import { sanityFetch } from "@/sanity/lib/client";
import type { SpotlightProduct } from "../product-spotlight-1/getSpotlightProduct";

export async function getSpotlight3Product() {
  const data = await sanityFetch<any>({
    query: `*[_type == "homepageData"][0].spotlight3Data{
      promoTitle,
      promoSubtitle,
      promoText,
      productRef->{
        _id,
        name,
        brand,
        displayPrice,
        image{asset->{url}},
        overviewFields
      }
    }`
  });

  return data;
}
