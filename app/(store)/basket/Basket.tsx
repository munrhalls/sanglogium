"use client";
import React from "react";
import Link from "next/link";
import { useBasketStore } from "@/store/store";
import BasketControls from "@/app/components/features/basket/BasketControls";

export default function Basket() {
  const basket = useBasketStore((s) => s.basket);

  return (
    <div>
      {/* Header row - desktop only */}
      <div className="hidden lg:grid lg:grid-cols-[3fr_1fr_1fr_auto] border-b border-secondary p-5 type-metadata">
        <div className="text-secondary">Product</div>
        <div className="text-center text-secondary">Price</div>
        <div className="text-center text-secondary">Quantity</div>
        <div></div>
      </div>

      {basket.map((item) => (
        <div
          key={item._id + "Basket page"}
          className="grid grid-cols-1 gap-5 border-b border-secondary p-5 lg:grid-cols-[3fr_1fr_1fr_auto] transition-colors duration-200 hover:bg-surface-subtle"
        >
          {/* Product column */}
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-surface-productImage">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <Link href={`/product/${item._id}`}>
                <h3 className="type-body hover:text-brand-100 transition-colors">
                  {item.name}
                </h3>
              </Link>
              <p className="type-metadata lg:hidden">
                <span className="type-price">${item.displayPrice.toFixed(2)}</span>
                {" "}× {item.quantity}
              </p>
            </div>
          </div>

          {/* Price column - desktop only */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <span className="type-price">${item.displayPrice.toFixed(2)}</span>
          </div>

          {/* Quantity column */}
          <div className="flex items-center lg:justify-center">
            <div className="mr-3 lg:hidden type-caption">Quantity:</div>
            <BasketControls product={item} />
          </div>
        </div>
      ))}
    </div>
  );
}
