import { sanityFetch } from "@/sanity/lib/client";

export interface IemProduct {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  slug: string;
  imageUrl: string;
  image: { asset: { url: string }; alt?: string };
}

const IEMS_QUERY = `*[_type == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  brand,
  displayPrice,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image{asset->{url}}
}`;

export async function getIemProducts(): Promise<IemProduct[]> {
  const result = await sanityFetch({ query: IEMS_QUERY }) as IemProduct[];
  return result ?? [];
}
