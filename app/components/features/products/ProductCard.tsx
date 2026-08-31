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
  priority?: boolean;
}

export function ProductCard({
  product,
  isWishlisted = false,
  priority = false,
}: ProductCardProps) {
  const displayPrice = centsToDisplay(product.price_data.unit_amount);

  return (
    <div className="relative h-full min-w-0">
      <article
        className="group card-product-dark relative col-span-1 flex h-full min-w-0 flex-col overflow-hidden !p-0 duration-300"
        data-testid="product-card"
      >
        <WishlistButton
          productId={product._id}
          initiallyInWishlist={isWishlisted}
          className="absolute right-3 top-3 z-20"
        />

        <Link href={`/product/${product.slug.current}`} className="block">
          <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage">
            <ProductImage
              image={product.image}
              alt={product.name}
              priority={priority}
            />
          </figure>
          <div className="flex min-w-0 flex-grow flex-col gap-1 p-3">
            {product.brand?.name && (
              <span className="type-product-brand">
                {product.brand.name}
              </span>
            )}
            <h3 className="type-product-title line-clamp-2 min-h-[2.5em]">
              {product.name}
            </h3>
          </div>
        </Link>

        <div className="flex items-center gap-2 px-3 pb-3">
          <Price value={displayPrice} className="type-product-price tabular-nums" />
          <div className="ml-auto">
            <BasketControls
              productId={product._id}
              isBasketPage={false}
              label="Add"
              addClassName="btn-product-add"
              wrapperClassName="flex items-center gap-1"
            />
          </div>
        </div>
      </article>
    </div>
  );
}
