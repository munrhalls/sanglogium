import { sanityFetch } from "@/sanity/lib/client";
import { cache } from "react";
import type { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";
import type { Spotlight1Product } from "../product-spotlight-1/getSpotlight1Data";

const SPOTLIGHT3_QUERY = `*[_type == "homepageData"][0].spotlight3Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand->{ _id, name, slug }, price_data,
    image{asset->{url}},
    gallery[]{asset->{url}}
  }
}`;

function processProductImages(product: Spotlight1Product): Spotlight1Product {
  if (!product.image) return product;

  const images = [product.image];
  if (product.gallery && product.gallery.length > 0) {
    images.push(...product.gallery);
  }

  return { ...product, images };
}

export const getSpotlight3Data = cache(async (): Promise<Spotlight1Data | null> => {
  const data = await sanityFetch({ query: SPOTLIGHT3_QUERY });

  if (data && data.productRef) {
    data.productRef = processProductImages(data.productRef);
  }

  return data;
});
