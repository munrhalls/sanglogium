"use client";
import React from "react";
import { useBasketStore } from "@/store/store";
import { X, ShoppingCart } from "@phosphor-icons/react";
import { BasketItem } from "../basket/basket.types";

const BasketControls = function BasketControls({
  product,
}: {
  product: BasketItem;
}) {
  const _id = product._id;
  const item = useBasketStore((s) =>
    s.basket.find((i) => i._id === product._id)
  );
  const addItem = useBasketStore((s) => s.addItem);
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeItem = useBasketStore((s) => s.removeItem);
  if (!item) {
    const basketItem = {
      _id: product._id,
      stock: product.stock,
      name: product.name,
      displayPrice: product.displayPrice,
      quantity: 1,
    };
    return (
      <div
        className="flex flex-col items-center justify-start"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem(basketItem);
          }}
          aria-label="Add to Cart"
          className="mt-2 flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-black text-black transition-colors hover:bg-gray-800"
        >
          <span
            className="p-1"
            style={{ display: "inline-flex", lineHeight: 0 }}
          >
            <ShoppingCart className="text-white" size={24} />
          </span>
        </button>
      </div>
    );
  }
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
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
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
(prevProps, nextProps) => {
  return prevProps.product._id === nextProps.product._id;
};

export default BasketControls;
