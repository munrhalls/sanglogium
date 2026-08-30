import React from "react";
import { cn } from "@/lib/utils/tailwind";
import { ProductCard } from "./ProductCard";
import { productGridClass } from "./gridLayout";
import { ImageRevealScript } from "./ImageRevealScript";
import type { Product } from "@/sanity-cms/lib/products/getProductsByVfsKeys";

interface ProductGridProps {
  products: Product[];
  className?: string;
  wishlistProductIds?: string[];
}

export function ProductGrid({
  products,
  className,
  wishlistProductIds,
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

  const wishlistSet = wishlistProductIds ? new Set(wishlistProductIds) : null;

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
            isWishlisted={wishlistSet?.has(product._id) ?? false}
          />
        ))}
      </div>
    </>
  );
}
