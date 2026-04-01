import React from 'react';
import { cn } from "@/lib/utils/tailwind";
import { ProductCard } from './ProductCard';

interface Product {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  displayPrice: number;
  image: any;
  slug: { current: string };
}

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 px-4 text-center" role="status" data-testid="empty-products">
        <p className="type-body text-secondary">No products found in this category.</p>
      </div>
    );
  }

  return (
    <div
      data-testid="product-grid"
      className={cn(
        "grid gap-6",
        "grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
