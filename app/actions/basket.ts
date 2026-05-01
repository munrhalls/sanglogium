"use server";

import { getProductsByIds } from "@/sanity/lib/products/getProductsByIds";
import { Product } from "@/sanity/lib/products/getProductBySlug";
import {
  BasketSyncRequest,
  BasketSyncResponse,
  TransformedProductData,
} from "./basket/types";

export async function syncBasketProducts(
  request: BasketSyncRequest
): Promise<BasketSyncResponse> {
  const { productIds } = request;

  if (!productIds || productIds.length === 0) {
    return { available: [], unavailable: [] };
  }

  const products = await getProductsByIds(productIds);

  // Transform CMS data to basket store format
  const transformed: TransformedProductData[] = products.map((product) => ({
    productId: product._id,
    displayPrice: product.displayPrice,
    availableStock: product.stock - product.reservedStock,
  }));

  // Partition into available and unavailable
  const available = transformed.filter((item) => item.availableStock > 0);
  const unavailable = transformed.filter((item) => item.availableStock === 0);

  return { available, unavailable };
}
