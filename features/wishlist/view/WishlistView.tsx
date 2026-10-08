import React from 'react';
import Link from 'next/link';
import { ProductGrid } from '@/features/products';
import type { Product } from '@/features/products';
import { WishlistButton } from '@/features/wishlist/ui/WishlistButton';

interface WishlistPageViewProps {
  products: Product[];
}

export default function WishlistView({ products }: WishlistPageViewProps) {
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
          cardAction={(productId, className) => (
            <WishlistButton productId={productId} initiallyInWishlist variant="quiet" className={className} />
          )}
        />
      )}

      <Link href="/products" className="mt-4 inline-block text-blue-600 underline">
        Continue shopping
      </Link>
    </div>
  );
}
