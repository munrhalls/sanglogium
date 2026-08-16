import { sanityFetch } from "@/sanity-cms/lib/client";
import { defineQuery } from "next-sanity";
import type { IemProduct } from "@/sanity-cms/lib/homepage/getHomepageData";

export type { IemProduct };

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

export const HOME_12 = [
  "64-audio-u12t-in-ear-headphones",
  "64-audio-u4s-in-ear-headphones",
  "crinear-reference-in-ear-headphones",
  "moondrop-blessing-3-in-ear-monitor-iem-hybrid-earphones",
  "moondrop-dark-saber-in-ear-headphones",
  "moondrop-rays-gaming-iems",
  "moondrop-variations-tribrid-iem",
  "sennheiser-ie-900-in-ear-headphones",
  "softears-volume-s-in-ear-headphones",
  "thieaudio-hype-4-in-ear-headphones",
  "thieaudio-monarch-mkiii-in-ear-headphones",
  "truthear-nova-in-ear-headphones",
];

export async function getIemProductsBySlugs(slugs: string[]) {
  if (!slugs.length) return [];

  const products = await sanityFetch<IemProduct[]>({
    query: IEMS_BY_SLUGS_QUERY,
    params: { slugs },
  });

  const order = new Map(slugs.map((slug, idx) => [slug, idx]));

  return (products ?? [])
    .filter((p) => p.image?.asset?._id)
    .sort((a, b) => (order.get(a.slug) ?? Infinity) - (order.get(b.slug) ?? Infinity))
    .map((p) => ({
      ...p,
      brand: p.brand ?? { _id: "", name: "", slug: "" },
      price_data: p.price_data ?? { currency: "USD", unit_amount: 0 },
      stock: p.stock ?? 0,
      imageUrl: p.imageUrl ?? p.image?.asset?.url ?? "",
    }));
}
