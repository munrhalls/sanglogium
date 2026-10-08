import React from "react";
import { ProductCard } from "@/features/products/ui/card/ProductCard";
import type { CardAction } from "@/features/products/ui/card/ProductCard";
import type { Product } from "@/features/products/core/rules/productTypes";

interface ProductChunkProps {
  promise: Promise<Product[]>;
  cardAction?: CardAction;
  priority?: boolean;
}

export async function ProductChunkView({
  promise,
  cardAction,
  priority = false,
}: ProductChunkProps) {
  const products = await promise;

  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          cardAction={cardAction}
          priority={priority}
        />
      ))}
    </>
  );
}
