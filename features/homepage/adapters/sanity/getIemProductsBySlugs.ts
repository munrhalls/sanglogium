import "server-only";

import { sanityFetch } from "@/platform/sanity/client";
import { defineQuery } from "next-sanity";
import type { IemProduct } from "@/features/homepage/core/types/homepageTypes";

const IEMS_BY_SLUGS_QUERY = defineQuery(`*[_type == "product" && slug.current in $slugs] {
  _id,
  name,
  brand->{ _id, name, "slug": slug.current },
  price_data,
  stock,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image {
    asset->{
      _id,
      url
    },
    alt
  }
}`);

export async function fetchIemProductsBySlugs(slugs: string[]): Promise<IemProduct[]> {
  const products = await sanityFetch<IemProduct[]>({
    query: IEMS_BY_SLUGS_QUERY,
    params: { slugs },
  });

  return products ?? [];
}
