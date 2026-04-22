"use server";

import { getProductsByIds } from "@/sanity/lib/products/getProductsByIds";
import { Product } from "@/sanity/lib/products/getProductBySlug";

export async function fetchBasketProducts(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  return await getProductsByIds(ids);
}
