"use client";
import React from "react";
import { useBasketStore } from "@/store/store";
import { X } from "@phosphor-icons/react";
import { BasketItem } from "@/app/(store)/basket/basket.types";
import { QuantitySelector } from "@/app/components/ui/QuantitySelector";

const BasketControls = function BasketControls({
  product,
  onRemoveStart,
}: {
  product: BasketItem;
  onRemoveStart?: (id: string) => void;
}) {
  const _id = product._id;
  const item = useBasketStore((s) =>
    s.basket.find((i) => i._id === product._id)
  );
  const updateQuantity = useBasketStore((s) => s.updateQuantity);
  const removeItem = useBasketStore((s) => s.removeItem);

  if (!item) return null;

  const triggerRemove = () => {
    if (onRemoveStart) {
      onRemoveStart(_id);
    } else {
      removeItem(_id);
    }
  };

  const handleDecrement = () => {
    if (item.quantity === 1) {
      triggerRemove();
    } else {
      updateQuantity(_id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < product.stock) {
      updateQuantity(_id, item.quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <QuantitySelector
        quantity={item.quantity}
        min={1}
        max={product.stock}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        size="sm"
      />
      <button
        onClick={triggerRemove}
        aria-label={`Remove ${product.name} from basket`}
        className="w-8 h-8 flex items-center justify-center rounded-sm text-secondary-500 transition-colors duration-200 hover:text-error-500 hover:bg-error-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default BasketControls;
