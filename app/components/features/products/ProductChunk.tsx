import React from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/sanity-cms/lib/products/getProductsByVfsKeys";

interface ProductChunkProps {
  promise: Promise<Product[]>;
  wishlistProductIds?: string[];
  priority?: boolean;
}

export async function ProductChunk({
  promise,
  wishlistProductIds,
  priority = false,
}: ProductChunkProps) {
  const products = await promise;
  const wishlistSet = wishlistProductIds ? new Set(wishlistProductIds) : null;

  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isWishlisted={wishlistSet?.has(product._id) ?? false}
          priority={priority}
        />
      ))}
    </>
  );
}
