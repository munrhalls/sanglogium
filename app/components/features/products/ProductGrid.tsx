import React from 'react';
import { cn } from "@/lib/utils/tailwind";
import { ProductCard } from './ProductCard';
import type { Product } from '@/sanity-cms/lib/products/getProductsByVfsKeys';

interface ProductGridProps {
  products: Product[];
  className?: string;
  wishlistProductIds?: string[];
}

export function ProductGrid({ products, className, wishlistProductIds }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 px-4 text-center" role="status" data-testid="empty-products">
        <p className="type-body text-secondary">No products found in this category.</p>
      </div>
    );
  }

  const wishlistSet = wishlistProductIds ? new Set(wishlistProductIds) : null;

  return (
    <div
      data-testid="product-grid"
      className={cn(
        "grid gap-8",
        "grid-cols-1 xs:grid-cols-2 lg-desktop:grid-cols-3 lg-touch:grid-cols-2",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isWishlisted={wishlistSet?.has(product._id) ?? false}
        />
      ))}
    </div>
  );
}
