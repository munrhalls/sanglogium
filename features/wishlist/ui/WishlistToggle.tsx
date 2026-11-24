"use client";

import { useEffect } from "react";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import { useWishlistIds } from "@/features/wishlist/state/wishlistIdsStore";

interface WishlistToggleProps {
  productId: string;
  variant?: "default" | "quiet";
  className?: string;
}

export default function WishlistToggle({ productId, variant, className }: WishlistToggleProps) {
  const ids = useWishlistIds((state) => state.ids);
  const load = useWishlistIds((state) => state.load);
  const setIn = useWishlistIds((state) => state.setIn);

  useEffect(() => {
    void load();
  }, [load]);

  // The key remounts the button once, when the ids arrive, so its initial state is the loaded one.
  return (
    <WishlistButton
      key={ids ? "loaded" : "loading"}
      productId={productId}
      initiallyInWishlist={ids?.has(productId) ?? false}
      onChange={(next) => setIn(productId, next)}
      variant={variant}
      className={className}
    />
  );
}
