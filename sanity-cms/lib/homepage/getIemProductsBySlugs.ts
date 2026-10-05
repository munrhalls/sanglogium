import { sanityFetch } from "@/platform/db/client";
import { defineQuery } from "next-sanity";
import type { IemProduct } from "@/features/homepage";

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
