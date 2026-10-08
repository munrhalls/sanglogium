import React from 'react';
import { WishlistButton } from '@/features/wishlist/ui/WishlistButton';

interface WishlistToggleViewProps {
  productId: string;
  wishlistPromise: Promise<string[]>;
  variant?: "default" | "quiet";
  className?: string;
}

export default async function WishlistToggleView({
  productId,
  wishlistPromise,
  variant,
  className,
}: WishlistToggleViewProps) {
  const awaitedIds = await wishlistPromise;
  return (
    <WishlistButton
      productId={productId}
      initiallyInWishlist={awaitedIds.includes(productId)}
      variant={variant}
      className={className}
    />
  );
}
