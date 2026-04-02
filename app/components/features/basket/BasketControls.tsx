"use client";
import React from "react";
import { useBasketStore } from "@/store/store";
import { X } from "@phosphor-icons/react";
import { BasketItem } from "@/app/(store)/basket/basket.types";

const BasketControls = function BasketControls({
  product,
}: {
  product: BasketItem;
}) {
  const _id = product._id;
  const item = useBasketStore((s) =>
    s.basket.find((i) => i._id === product._id)
  );
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeItem = useBasketStore((s) => s.removeItem);

  if (!item) return null;
  const canIncrement = item.quantity < product.stock;
  const handleDecrement = (_e: React.MouseEvent) => {
    if (item.quantity === 1) {
      removeItem(_id);
    } else {
      updateQuantity(_id, item.quantity - 1);
    }
  };
  const handleRemove = (_e: React.MouseEvent) => {
    removeItem(_id);
  };
  const handleIncrement = (_e: React.MouseEvent) => {
    if (canIncrement) {
      updateQuantity(_id, item.quantity + 1);
    }
  };
  return (
    <div>
      <div className="text-lg font-bold">Purchase quantity:</div>
      <div className="flex items-center gap-x-2">
        <button
          aria-label="Increase quantity"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className="flex h-9 w-9 items-center justify-center rounded bg-black p-2 text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          +
        </button>
        <span className="w-6 text-center font-black">{item.quantity}</span>
        <button
          aria-label="Decrease quantity"
          onClick={handleDecrement}
          className="flex h-9 w-9 items-center justify-center rounded bg-black p-2 text-white transition-colors hover:bg-gray-800"
        >
          -
        </button>
        <button
          aria-label="Remove from basket"
          onClick={handleRemove}
          className="flex h-9 w-9 items-center justify-center rounded p-2 text-gray-400 transition-colors hover:text-red-500"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default BasketControls;
