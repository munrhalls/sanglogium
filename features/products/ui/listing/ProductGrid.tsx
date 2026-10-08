import React from "react";
import { cn } from "@/platform/utils/tailwind";
import { ProductCard } from "@/features/products/ui/card/ProductCard";
import type { CardAction } from "@/features/products/ui/card/ProductCard";
import { productGridClass } from "@/features/products/core/definitions/gridLayout";
import { ImageRevealScript } from "@/features/products/ui/card/ImageRevealScript";
import type { Product } from "@/features/products/core/types/productTypes";

interface ProductGridProps {
  products: Product[];
  className?: string;
  cardAction?: CardAction;
}

export function ProductGrid({
  products,
  className,
  cardAction,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div
        className="px-4 py-12 text-center"
        role="status"
        data-testid="empty-products"
      >
        <p className="text-secondary type-body">
          No products found in this category.
        </p>
      </div>
    );
  }

  return (
    <>
      <ImageRevealScript />
      <div
        data-testid="product-grid"
        className={cn(productGridClass, className)}
      >
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            cardAction={cardAction}
          />
        ))}
      </div>
    </>
  );
}
