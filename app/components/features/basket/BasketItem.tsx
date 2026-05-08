"use client";
import React from "react";
import Image from "next/image";
import { Price } from "@/app/components/ui/Price";
import { BasketControls } from "./BasketControls";

interface BasketItemProps {
  productId: string
  name: string
  quantity: number
  displayPriceAtAdd: number
  availableStockAtAdd: number
}

export default function BasketItem({ productId, name, quantity, displayPriceAtAdd, availableStockAtAdd }: BasketItemProps) {
  return (
    <div
      className="grid grid-cols-1 gap-5 border-b border-border-secondary p-5 lg-desktop:grid-cols-[3fr_1fr_1fr_1fr] lg-touch:grid-cols-[3fr_1fr_1fr_1fr] hover:bg-secondary-900/50"
    >
      {/* Product column */}
      <div className="flex items-center gap-5">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage relative">
          <Image
            src="/placeholder"
            alt={productId}
            fill
            unoptimized
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="type-body">
            {name}
          </h3>
          <p className="type-metadata lg-desktop:hidden lg-touch:hidden">
            <Price value={displayPriceAtAdd} />
            {" "}× {quantity}
          </p>
        </div>
      </div>

      {/* Price column - desktop only */}
      <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-center">
        <Price value={displayPriceAtAdd} />
      </div>

      {/* Quantity column */}
      <div className="flex items-center lg-desktop:justify-center lg-touch:justify-center">
        <BasketControls
          productId={productId}
          displayPriceAtAdd={displayPriceAtAdd}
          availableStockAtAdd={availableStockAtAdd}
          isBasketPage={true}
        />
      </div>

      {/* Total column - desktop only */}
      <div className="hidden lg-desktop:flex lg-touch:flex items-center justify-end">
        <Price value={displayPriceAtAdd * quantity} />
      </div>
    </div>
  );
}
