import React from "react";
import { ProductCardReveal } from "./ProductCardReveal";
import type { ProductCardData } from "@/sanity-cms/lib/products/getProductsSlice";

interface ProductCardRowProps {
  products: ProductCardData[];
  wishlistedIds: string[];
  /** Invisible placeholders to keep this row's height equal to its Suspense fallback. */
  padCount: number;
  /** Give this row's images a fetch head start (first visible row only). */
  priority?: boolean;
}

/**
 * Each card shows its real content as soon as its own product data exists —
 * text is never withheld, and each image fades in independently from its
 * own blur placeholder. See ProductCardReveal for why this replaced the
 * previous row-level all-or-nothing gate.
 */
export function ProductCardRow({ products, wishlistedIds, padCount, priority = false }: ProductCardRowProps) {
  const wishlistSet = new Set(wishlistedIds);

  return (
    <>
      {products.map((product) => (
        <ProductCardReveal
          key={product._id}
          product={product}
          isWishlisted={wishlistSet.has(product._id)}
          priority={priority}
        />
      ))}
      {Array.from({ length: padCount }).map((_, i) => (
        <div key={`pad-${i}`} className="invisible" aria-hidden="true">
          <ProductCardReveal />
        </div>
      ))}
    </>
  );
}
