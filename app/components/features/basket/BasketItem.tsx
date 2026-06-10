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
  availableStock: number
  originalQuantity?: number
}

export default function BasketItem({ productId, name, quantity, displayPrice, image, availableStock, originalQuantity }: BasketItemProps) {
  const assetRef = image?.asset?._ref || image?.asset?._id;

  return (
    <>
      {/* Desktop row */}
      <div className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center px-6 py-5 gap-5 border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150">
        {/* Column 1 — Product */}
        <div className="flex flex-row items-center gap-4">
          <div className="h-20 w-20 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary">
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
          <h3 className="type-card-title line-clamp-2 min-w-0">
            {name}
          </h3>
        </div>

        {/* Column 2 — Unit Price */}
        <div className="flex items-center justify-center whitespace-nowrap">
          <Price value={displayPrice} currency="PLN" />
        </div>

        {/* Column 3 — Quantity */}
        <div className="flex items-center justify-center gap-2">
          {originalQuantity && originalQuantity > quantity && (
            <span className="type-caption text-text-caption line-through">{originalQuantity}</span>
          )}
          <BasketControls
            productId={productId}
            name={name}
            isBasketPage={true}
            maxQuantity={availableStock}
            displayQuantity={quantity}
          />
        </div>

        {/* Column 4 — Line Total */}
        <div className="flex items-center justify-end whitespace-nowrap">
          <Price value={displayPrice * quantity} currency="PLN" />
        </div>
      </div>

      {/* Mobile row — two-zone layout */}
      <div className="lg-desktop:hidden lg-touch:hidden flex flex-col border-b border-border-secondary/60 px-4 hover:bg-surface-elevated transition-colors duration-150">
        {/* Zone A — Info strip */}
        <div className="flex flex-row items-start gap-3 py-3">
          <div className="h-16 w-16 flex-shrink-0 rounded-sm bg-surface-productImage overflow-hidden relative border border-border-secondary">
            {assetRef ? (
              <Image
                src={assetRef}
                loader={sanityImageLoader}
                alt={name}
                fill
                sizes="64px"
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-caption type-caption">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h3 className="type-card-title line-clamp-2">
              {name}
            </h3>
            <span className="type-metadata">
              Unit: <Price value={displayPrice} currency="PLN" />
            </span>
          </div>
        </div>

        {/* Zone B — Controls strip */}
        <div className="flex flex-row items-center justify-between py-3 border-t border-border-secondary/30">
          <div className="flex items-center gap-2">
            {originalQuantity && originalQuantity > quantity && (
              <span className="type-caption text-text-caption line-through">{originalQuantity}</span>
            )}
            <BasketControls
              productId={productId}
              name={name}
              isBasketPage={true}
              maxQuantity={availableStock}
              displayQuantity={quantity}
            />
          </div>
          <div className="type-price">
            <Price value={displayPrice * quantity} currency="PLN" />
          </div>
        </div>
      </div>
    </>
  );
}
