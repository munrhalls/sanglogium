import React from "react";
import { ProductCardReveal } from "./ProductCardReveal";
import type { ProductCardData } from "@/sanity-cms/lib/products/getProductsSlice";

interface ProductCardProps {
  product: ProductCardData;
  isWishlisted?: boolean;
}

/**
 * Non-streamed usage (e.g. ProductGrid): the product is already fully
 * loaded server-side, so there's no row to gate on — show it immediately.
 */
export function ProductCard({
  product,
  isWishlisted = false,
}: ProductCardProps) {
  return <ProductCardReveal product={product} isWishlisted={isWishlisted} ready />;
}
