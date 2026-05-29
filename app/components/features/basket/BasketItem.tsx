"use client";
import React from "react";
import Image from "next/image";
import { Price } from "@/app/components/ui/Price";
import { BasketControls } from "./BasketControls";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";

interface BasketItemProps {
  productId: string
  name: string
  quantity: number
  displayPrice: number
  image?: any
}

export default function BasketItem({ productId, name, quantity, displayPrice, image }: BasketItemProps) {
  const assetRef = image?.asset?._ref || image?.asset?._id;

  return (
    <div
      className="grid grid-cols-1 gap-6 border-b border-border-secondary/60 p-4 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] lg-desktop:gap-5 lg-desktop:p-5 lg-touch:gap-5 lg-touch:p-5 hover:bg-secondary-900/50"
    >
      {/* Product column */}
      <div className="flex flex-col gap-4 lg-desktop:flex-row lg-desktop:gap-5 lg-desktop:items-center lg-touch:flex-row lg-touch:gap-5 lg-touch:items-center">
        {/* Row 1: Image + name */}
        <div className="flex items-start gap-4">
          <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-subtle border border-border-secondary relative">
            {assetRef ? (
              <Image
                src={assetRef}
                loader={sanityImageLoader}
                alt={name}
                fill
                sizes="96px"
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-caption type-caption">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="type-body text-secondary-400">
              {name}
            </h3>
            {/* Total - prominent on mobile */}
            <p className="type-h3 font-bold text-text-primary">
              Total: <Price value={displayPrice * quantity} />
            </p>
          </div>
        </div>

        {/* Row 2: Controls at bottom for thumb zone (mobile only) */}
        <div className="flex items-center justify-end pr-4 lg-desktop:hidden lg-touch:hidden">
          <BasketControls
            productId={productId}
            isBasketPage={true}
            decrementClassName="bg-surface-elevated text-text-body rounded-md p-2 h-9 w-9 flex items-center justify-center hover:bg-surface-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            incrementClassName="bg-surface-elevated text-text-body rounded-md p-2 h-9 w-9 flex items-center justify-center hover:bg-surface-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            quantityClassName="font-bold w-6 text-center type-body bg-surface-elevated border border-border-secondary rounded"
            removeClassName="bg-error-500 text-white hover:bg-error-700 transition-colors rounded-md p-2 h-9 w-9 flex items-center justify-center"
            wrapperClassName="gap-1"
          />
        </div>
      </div>

      {/* Price column - desktop only */}
      <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
        <Price value={displayPrice} />
      </div>

      {/* Quantity column - desktop only */}
      <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
        <BasketControls
          productId={productId}
          isBasketPage={true}
        />
      </div>

      {/* Total column - desktop only */}
      <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-end">
        <Price value={displayPrice * quantity} />
      </div>
    </div>
  );
}
