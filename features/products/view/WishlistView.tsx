import React from 'react';
import Link from 'next/link';
import { ProductGrid } from '@/features/products/ui/listing/ProductGrid';
import type { Product } from '@/features/products/core/rules/productTypes';

interface WishlistPageViewProps {
  products: Product[];
}

export default function WishlistView({ products }: WishlistPageViewProps) {
  const productIds = products.map((product) => product._id);

  return (
    <div className="mx-auto w-full max-w-catalogue px-4 md:px-8 py-6">
      <h1 className="mb-4 text-2xl font-bold">My Wishlist</h1>

      {products.length === 0 ? (
        <p className="type-body text-secondary">Your wishlist is empty.</p>
      ) : (
        // No sidebar: cap the grid at max-w-content so wide screens stop at
        // ~5 columns instead of running to 6-7.
        <ProductGrid
          products={products}
          className="max-w-content"
          wishlistProductIds={productIds}
        />
      )}

      <Link href="/products" className="mt-4 inline-block text-blue-600 underline">
        Continue shopping
      </Link>
    </div>
  );
}
