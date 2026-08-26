"use client";

import React from "react";
import Link from "next/link";
import { ProductImage } from "./ProductImage";
import type { Product } from "@/sanity-cms/lib/products/getProductsByVfsKeys";
import { Price } from "@/app/components/ui/Price";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { WishlistButton } from "@/app/components/features/wishlist/WishlistButton";
import { centsToDisplay } from "@/lib/utils/price";

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
}

export function ProductCard({
  product,
  isWishlisted = false,
}: ProductCardProps) {
  const displayPrice = centsToDisplay(product.price_data.unit_amount);

  return (
    <div className="relative h-full">
      <article
        className="group card-product-dark relative col-span-1 flex h-full flex-col duration-300"
        data-testid="product-card"
      >
        <WishlistButton
          productId={product._id}
          initiallyInWishlist={isWishlisted}
          className="absolute right-3 top-3 z-20"
        />

        <Link href={`/product/${product.slug.current}`} className="block">
          <figure className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-surface-productImage p-4">
            {product.brand?.name && (
              <span className="type-caption absolute left-3 top-3 z-10 text-brand-900">
                {product.brand.name}
              </span>
            )}
            <ProductImage
              image={product.image}
              alt={product.name}
              className="group-hover:scale-110 transition-opacity duration-300 opacity-100"
            />
          </figure>
          <div className="flex flex-grow flex-col gap-1 p-3">
            <h3 className="type-body line-clamp-2 h-10 font-medium">
              {product.name}
            </h3>
          </div>
        </Link>

        <div className="flex items-center gap-2 px-3 pb-3">
          <Price value={displayPrice} />
          <div className="ml-auto">
            <BasketControls
              productId={product._id}
              isBasketPage={false}
              wrapperClassName="flex items-center gap-1"
            />
          </div>
        </div>
      </article>
    </div>
  );
}
