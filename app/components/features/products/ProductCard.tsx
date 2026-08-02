"use client";

import React from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import type { Product } from '@/sanity-cms/lib/products/getProductsByVfsKeys';
import { Price } from '@/app/components/ui/Price';
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { WishlistButton } from "@/app/components/features/wishlist/WishlistButton";
import { centsToDisplay } from '@/lib/utils/price';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
}

export function ProductCard({ product, isWishlisted = false }: ProductCardProps) {
  const displayPrice = centsToDisplay(product.price_data.unit_amount);

  return (
    <article
      className="card-product-dark group relative flex h-full flex-col col-span-1"
      data-testid="product-card"
    >
      <WishlistButton
        productId={product._id}
        initiallyInWishlist={isWishlisted}
        className="absolute right-3 top-3 z-20"
      />

      <Link href={`/product/${product.slug.current}`} className="block">
        <figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
          {product.brand?.name && (
            <span className="absolute left-4 top-4 type-caption text-brand-900 z-10">
              {product.brand.name}
            </span>
          )}
          <ProductImage
            image={product.image}
            alt={product.name}
            className="group-hover:scale-110"
          />
        </figure>

        <div className="flex flex-col flex-grow gap-3 p-4">
          <h3 className="type-body font-medium line-clamp-2">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="flex items-center justify-between px-4 pb-4">
        <Price value={displayPrice} />
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart"
          wrapperClassName="flex items-center gap-1 flex-shrink-0"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}

