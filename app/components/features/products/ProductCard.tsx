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

  // When the brand eyebrow is shown, drop a leading brand token from the VISIBLE
  // title if it exactly (case-insensitive) matches the brand name — the full
  // name still lives in the image alt and the link aria-label.
  const brandName = product.brand?.name?.trim();
  const visibleTitle =
    brandName &&
    product.name.toLowerCase().startsWith(`${brandName.toLowerCase()} `)
      ? product.name.slice(brandName.length).trimStart()
      : product.name;

  return (
    <div className="relative h-full min-w-0">
      <article
        className="group card-product-dark relative col-span-1 flex h-full min-w-0 flex-col overflow-hidden !p-0 duration-300"
        data-testid="product-card"
      >
        <WishlistButton
          productId={product._id}
          initiallyInWishlist={isWishlisted}
          variant="quiet"
          className="absolute right-1 top-1 z-20"
        />

        <Link
          href={`/product/${product.slug.current}`}
          className="block"
          aria-label={product.name}
        >
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
            <h3 className="type-product-title line-clamp-3 min-h-[3.9em] sm:line-clamp-2 sm:min-h-9">
              {visibleTitle}
            </h3>
          </div>
        </Link>

        <div className="flex flex-col items-stretch gap-2 px-3 pb-3 sm:flex-row sm:items-center">
          <Price value={displayPrice} className="type-product-price tabular-nums" />
          <div className="flex min-h-9 w-full items-center sm:ml-auto sm:min-h-0 sm:w-auto">
            <BasketControls
              productId={product._id}
              isBasketPage={false}
              label="Add"
              size="sm"
              fullWidth
              addClassName="btn-product-add"
              wrapperClassName="flex items-center gap-1"
            />
          </div>
        </div>
      </article>
    </div>
  );
}
