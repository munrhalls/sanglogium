"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ProductCardReveal } from "./ProductCardReveal";
import type { ProductCardData } from "@/sanity-cms/lib/products/getProductsSlice";

interface ProductCardRowProps {
  products: ProductCardData[];
  wishlistedIds: string[];
  /** Invisible placeholders to keep this row's height equal to its Suspense fallback. */
  padCount: number;
}

/**
 * Gates the reveal on the whole row, not on each card's own image. Cards
 * report their own load via onImageLoad; only once every card in the row
 * has reported does `ready` flip, so the row swaps skeleton -> real in one
 * paint instead of resettling once per card as images trickle in.
 */
export function ProductCardRow({ products, wishlistedIds, padCount }: ProductCardRowProps) {
  const [loadedCount, setLoadedCount] = useState(0);
  const wishlistSet = useMemo(() => new Set(wishlistedIds), [wishlistedIds]);
  const ready = products.length > 0 && loadedCount >= products.length;

  const handleImageLoad = useCallback(() => {
    setLoadedCount((count) => count + 1);
  }, []);

  return (
    <>
      {products.map((product) => (
        <ProductCardReveal
          key={product._id}
          product={product}
          isWishlisted={wishlistSet.has(product._id)}
          ready={ready}
          onImageLoad={handleImageLoad}
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
