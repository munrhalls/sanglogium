"use client";
import React from "react";
import Image from "next/image";
import { Trash } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";
import { BasketControls } from "./BasketControls";
import useBasketStore from "@/store/basketStore";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";
import { formatPriceMajor } from "@/lib/utils/price";

interface BasketItemProps {
  productId: string
  name: string
  quantity: number
  displayPrice: number
  image?: any
  availableStock: number
  originalQuantity?: number
  variant?: string
}

export default function BasketItem({ productId, name, quantity, displayPrice, image, availableStock, originalQuantity, variant }: BasketItemProps) {
  const isOutOfStock = availableStock === 0;
  const { removeProduct } = useBasketStore(
    useShallow((state) => ({
      removeProduct: state.removeProduct,
    }))
  );
  const assetRef = image?.asset?._ref || image?.asset?._id;

  const handleRemove = () => {
    removeProduct(productId);
  };

  return (
    <>
      {/* Desktop row */}
      <article className="hidden lg-desktop:grid lg-touch:grid grid-cols-[minmax(0,1fr)_auto_auto] items-start px-6 py-5 gap-[2rem] border-b border-border-secondary/60 hover:bg-surface-elevated transition-colors duration-150">
        {/* Column 1 — item-identity */}
        <div className="item-identity flex flex-row items-start gap-4">
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
          <div className="item-text-stack flex flex-col min-w-0 gap-1">
            <h3 className="type-card-title line-clamp-4">{name}</h3>
            {variant && (
              <span className="type-metadata">{variant}</span>
            )}
            {isOutOfStock && (
              <span className="type-caption text-error-700 font-medium">Out of Stock</span>
            )}
            <span className="type-caption text-text-secondary tabular-nums">
              {formatPriceMajor(displayPrice)}
            </span>
          </div>
        </div>

        {/* Column 2 — quantity & total */}
        <div className="flex flex-row items-center gap-8 justify-end mt-5">
          {originalQuantity && originalQuantity > quantity && (
            <span className="type-caption text-text-caption line-through">{originalQuantity}</span>
          )}
          <fieldset disabled={isOutOfStock} className="border-0 p-0 m-0 min-w-0">
            <BasketControls
              productId={productId}
              name={name}
              isBasketPage={true}
              maxQuantity={availableStock}
              displayQuantity={quantity}
              showRemoveButton={false}
            />
          </fieldset>
          <div className="w-24 text-right">
            <span className="tabular-nums">{formatPriceMajor(displayPrice * quantity)}</span>
          </div>
        </div>

        {/* Column 3 — item-actions */}
        <div className="item-actions flex items-center justify-center mt-5">
          <button
            onClick={handleRemove}
            data-testid={`remove-${productId}`}
            aria-label={`Remove ${name} from basket`}
            type="button"
            className="text-text-secondary hover:text-red-500/80 transition-colors duration-200 p-2"
          >
            <Trash size={20} />
          </button>
        </div>
      </article>

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
            <h3 className="text-sm font-normal text-text-body leading-snug">{name}</h3>
            {variant && (
              <span className="type-metadata">{variant}</span>
            )}
            {isOutOfStock && (
              <span className="text-xs text-error-700 font-medium">Out of Stock</span>
            )}
            <span className="type-caption text-text-secondary tabular-nums">
              {formatPriceMajor(displayPrice)}
            </span>
          </div>
        </div>

        {/* Zone B — Controls strip */}
        <div className="flex flex-row items-center justify-between flex-wrap gap-4 pt-3 border-t border-border-secondary/30">
          <div className="flex items-center gap-2">
            {originalQuantity && originalQuantity > quantity && (
              <span className="type-caption text-text-caption line-through">{originalQuantity}</span>
            )}
            <fieldset disabled={isOutOfStock} className="border-0 p-0 m-0 min-w-0">
              <BasketControls
                productId={productId}
                name={name}
                isBasketPage={true}
                maxQuantity={availableStock}
                displayQuantity={quantity}
                showRemoveButton={false}
              />
            </fieldset>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRemove}
              data-testid={`remove-mobile-${productId}`}
              aria-label={`Remove ${name} from basket`}
              type="button"
              className="text-text-secondary hover:text-red-500/80 transition-colors duration-200 p-2"
            >
              <Trash size={20} />
            </button>
            <span className="type-body font-bold tabular-nums">
              {formatPriceMajor(displayPrice * quantity)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
