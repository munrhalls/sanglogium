"use client";
import React from "react";
import Image from "next/image";
import { dataset, projectId } from '@/sanity-config/env';
import urlBuilder from '@sanity/image-url';
import { Price } from "@/app/components/ui/Price";
import { BasketControls } from "./BasketControls";

const builder = urlBuilder({ projectId, dataset });

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
      className="grid grid-cols-1 gap-5 border-b border-border-secondary p-5 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] hover:bg-secondary-900/50"
    >
      {/* Product column */}
      <div className="flex items-center gap-5">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage relative">
          {assetRef ? (
            <Image
              src={assetRef}
              alt={name}
              fill
              sizes="96px"
              className="object-contain"
              loader={({ src, width, quality }) => {
                const url = builder
                  .image(src)
                  .width(width)
                  .quality(quality || 75)
                  .auto("format")
                  .url();
                return url;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-caption type-caption">
              No image
            </div>
          )}
        </div>
        <div>
          <h3 className="type-body">
            {name}
          </h3>
          <p className="type-metadata lg-desktop:hidden lg-touch:hidden">
            <Price value={displayPrice} />
            {" "}× {quantity}
          </p>
        </div>
      </div>

      {/* Price column - desktop only */}
      <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
        <Price value={displayPrice} />
      </div>

      {/* Quantity column */}
      <div className="flex items-center lg-desktop:justify-center lg-touch:justify-center">
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
