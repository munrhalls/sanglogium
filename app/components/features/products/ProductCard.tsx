import React from "react";
import { ProductCardReveal } from "./ProductCardReveal";
import type { ProductCardData } from "@/sanity-cms/lib/products/getProductsSlice";

interface ProductCardProps {
  product: ProductCardData;
  isWishlisted?: boolean;
}

/** Non-streamed usage (e.g. ProductGrid): product data is already resolved server-side. */
export function ProductCard({
  product,
  isWishlisted = false,
}: ProductCardProps) {
  return <ProductCardReveal product={product} isWishlisted={isWishlisted} />;
}
