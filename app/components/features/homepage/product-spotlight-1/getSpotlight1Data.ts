import { sanityFetch } from "@/sanity-cms/lib/client";
import { cache } from "react";

export interface Spotlight1Product {
  _id: string;
  name: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  price_data: { currency: string; unit_amount: number };
  image: { asset: { _id: string; url: string }; alt?: string };
  gallery?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
  images?: Array<{ asset: { _id: string; url: string }; alt?: string }>;
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

export const getSpotlight1Data = cache(async (): Promise<Spotlight1Data | null> => {
  const data = await sanityFetch({ query: SPOTLIGHT1_QUERY });

  if (data && data.productRef) {
    data.productRef = processProductImages(data.productRef);
  }

  return data;
});
