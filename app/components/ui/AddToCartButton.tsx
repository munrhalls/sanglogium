"use client";

import React from "react";
import { useBasketStore } from "@/store/store";
import { ShoppingCartIcon } from "@phosphor-icons/react";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  displayPrice: number;
  stock: number;
  imageUrl: string;
  slug: string;
  className?: string;
  labelClassName?: string;
  label?: string;
  shortLabel?: string;
}

export function AddToCartButton({
  productId,
  name,
  displayPrice,
  stock,
  imageUrl,
  slug,
  className = "",
  labelClassName = "text-cap font-bold",
  label = "Add",
  shortLabel,
}: AddToCartButtonProps) {
  const item = useBasketStore((s) =>
    s.basket.find((i) => i._id === productId)
  );
  const addItem = useBasketStore((s) => s.addItem);
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeItem = useBasketStore((s) => s.removeItem);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAdd = (e: React.MouseEvent) => {
    stop(e);
    addItem({
      _id: productId,
      name,
      displayPrice,
      stock: stock ?? 99,
      quantity: 1,
      image: imageUrl,
      slug,
    });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    stop(e);
    if (item && item.quantity < (stock ?? 99)) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    stop(e);
    if (item) {
      if (item.quantity <= 1) {
        removeItem(productId);
      } else {
        updateQuantity(productId, item.quantity - 1);
      }
    }
  };

  if (item) {
    return (
      <div
        className="flex items-center gap-1"
        onClick={stop}
        role="group"
        aria-label={`${name} quantity controls`}
      >
        <button
          onClick={handleDecrement}
          className="btn-secondary w-8 h-8 flex items-center justify-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span
          className="w-7 text-center type-body text-primary tabular-nums"
          role="status"
          aria-live="polite"
        >
          {item.quantity}
        </span>
        <button
          onClick={handleIncrement}
          disabled={item.quantity >= (stock ?? 99)}
          className="btn-secondary w-8 h-8 flex items-center justify-center text-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`btn-cart transition-all active:scale-95 ${className}`}
      aria-label={`Add ${name} to cart`}
    >
      <ShoppingCartIcon size={18} weight="regular" />
      {shortLabel ? (
        <>
          <span className={`hidden md:block ${labelClassName}`}>{label}</span>
          <span className={`md:hidden ${labelClassName}`}>{shortLabel}</span>
        </>
      ) : (
        <span className={labelClassName}>{label}</span>
      )}
    </button>
  );
}
