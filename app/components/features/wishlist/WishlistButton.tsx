"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import { authClient } from "@/lib/auth-client";
import { addToWishlist, removeFromWishlist } from "@/app/(store)/account/wishlist/actions";

interface WishlistButtonProps {
  productId: string;
  initiallyInWishlist?: boolean;
  className?: string;
}

export function WishlistButton({
  productId,
  initiallyInWishlist = false,
  className = "",
}: WishlistButtonProps) {
  const { data: sessionData } = authClient.useSession();
  const [inWishlist, setInWishlist] = useState(initiallyInWishlist);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const isSignedIn = !!sessionData?.session;

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      window.location.href = `/sign-in?returnTo=${encodeURIComponent(pathname)}`;
      return;
    }

    const next = !inWishlist;

    startTransition(async () => {
      const result = next ? await addToWishlist(productId) : await removeFromWishlist(productId);
      if (result && "success" in result && result.success) {
        setInWishlist(next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`
        flex h-10 w-10 items-center justify-center rounded-full
        border border-border-primary bg-surface-elevated
        text-brand-400 transition-colors hover:bg-surface-subtle
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <Heart
        weight={inWishlist ? "fill" : "regular"}
        className={`h-5 w-5 ${inWishlist ? "text-error-500" : "text-brand-400"}`}
      />
    </button>
  );
}
