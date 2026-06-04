import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";
import type { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";
import type { Spotlight1Product } from "../product-spotlight-1/getSpotlight1Data";

const SPOTLIGHT2_QUERY = `*[_type == "homepageData"][0].spotlight2Data{
  promoTitle,
  promoSubtitle,
  promoText,
  productRef->{
    _id, name, brand->{ _id, name, slug }, price_data,
    image{asset->{_id, url}},
    gallery[]{asset->{_id, url}}
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

export const getSpotlight2Data = cache(async (): Promise<Spotlight1Data | null> => {
  const data = await sanityFetch({ query: SPOTLIGHT2_QUERY }) as Spotlight1Data | null;

  if (data && data.productRef) {
    data.productRef = processProductImages(data.productRef);
  }

  return data;
});
