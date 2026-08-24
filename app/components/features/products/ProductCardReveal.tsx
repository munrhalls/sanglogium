"use client";

import React from "react";
import Link from "next/link";
import { ProductImage } from "./ProductImage";
import type { ProductCardData } from "@/sanity-cms/lib/products/getProductsSlice";
import { Price } from "@/app/components/ui/Price";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { WishlistButton } from "@/app/components/features/wishlist/WishlistButton";
import { centsToDisplay } from "@/lib/utils/price";

interface ProductCardRevealProps {
  /** Omitted entirely = pure skeleton (route-level Suspense fallback, before any data exists). */
  product?: ProductCardData;
  isWishlisted?: boolean;
  /** Whether this card is allowed to show real content yet. Ignored when `product` is omitted. */
  ready?: boolean;
  /** Fired once this card's own image has resolved (or failed). Used to gate the whole row. */
  onImageLoad?: () => void;
}

const shimmer = "animate-pulse rounded bg-secondary-800";

/**
 * Single markup tree for both the skeleton and the finished card — loading
 * and loaded states only swap leaf content (image opacity, text vs. a
 * shimmer div) inside identical wrappers/classNames. This is deliberate:
 * two hand-maintained components (a skeleton file + a real-card file) can
 * silently drift a few pixels apart with nothing to catch it. One tree
 * can't drift from itself.
 */
export function ProductCardReveal({
  product,
  isWishlisted = false,
  ready = false,
  onImageLoad,
}: ProductCardRevealProps) {
  const showReal = ready && !!product;
  const displayPrice = product ? centsToDisplay(product.price_data.unit_amount) : "";

  const media = (
    <figure className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-surface-productImage p-4">
      {showReal && product?.brand?.name ? (
        <span className="type-caption absolute left-3 top-3 z-10 text-brand-900">
          {product.brand.name}
        </span>
      ) : (
        <div data-testid="skeleton-brand" className={`absolute left-3 top-3 z-10 h-3 w-12 ${shimmer}`} />
      )}
      {product && (
        <ProductImage
          image={product.image}
          alt={product.name}
          className={`group-hover:scale-110 transition-opacity duration-300 ${showReal ? "opacity-100" : "opacity-0"}`}
          onLoad={onImageLoad}
        />
      )}
      {!showReal && (
        <div data-testid="skeleton-image" className={`absolute inset-0 ${shimmer}`} />
      )}
    </figure>
  );

  const title = (
    <div className="flex flex-grow flex-col gap-1 p-3">
      <h3 className="type-body line-clamp-2 h-10 font-medium">
        {showReal ? (
          product!.name
        ) : (
          <span data-testid="skeleton-title" className={`block h-full w-full ${shimmer}`} />
        )}
      </h3>
    </div>
  );

  return (
    <div className="relative h-full">
      <article
        className={`group card-product-dark relative col-span-1 flex h-full flex-col duration-300 ${showReal ? "" : "animate-pulse"}`}
        data-testid={showReal ? "product-card" : "product-card-skeleton"}
      >
        {product && (
          <WishlistButton
            productId={product._id}
            initiallyInWishlist={isWishlisted}
            className="absolute right-3 top-3 z-20"
          />
        )}

        {product ? (
          <Link href={`/product/${product.slug.current}`} className="block">
            {media}
            {title}
          </Link>
        ) : (
          <div className="block">
            {media}
            {title}
          </div>
        )}

        <div className="flex items-center gap-2 px-3 pb-3">
          {showReal ? (
            <Price value={displayPrice} />
          ) : (
            <div data-testid="skeleton-price" className={`h-4 w-1/4 ${shimmer}`} />
          )}
          <div className="ml-auto">
            {showReal ? (
              <BasketControls
                productId={product!._id}
                isBasketPage={false}
                wrapperClassName="flex items-center gap-1"
              />
            ) : (
              <div data-testid="skeleton-button" className={`h-8 w-16 ${shimmer} ml-auto`} />
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
