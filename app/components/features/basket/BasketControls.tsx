"use client";

import { useShallow } from 'zustand/shallow';
import { ShoppingCart } from "@phosphor-icons/react";
import useBasketStore from "@/store/basketStore";

interface BasketControlsProps {
  productId: string;
  name?: string;
  isBasketPage: boolean;
  maxQuantity?: number;
  displayQuantity?: number;
  label?: string;
  removeClassName?: string;
  addClassName?: string;
  wrapperClassName?: string;
  showRemoveButton?: boolean;
  size?: "sm" | "md";
  /**
   * Stretch the post-click stepper to fill its container, with each cell
   * sharing the width equally. Used on narrow card footers (product grid,
   * homepage cards) so the − N + control is bounded by the card and never
   * overflows past its edges.
   */
  fullWidth?: boolean;
}

export function BasketControls({
  productId,
  name,
  isBasketPage,
  maxQuantity,
  displayQuantity,
  label = "Add to Cart",
  removeClassName,
  addClassName,
  wrapperClassName,
  showRemoveButton,
  size = "md",
  fullWidth = false,
}: BasketControlsProps) {
  const stepperCellClass = `btn-stepper${size === "sm" ? " btn-stepper-sm" : ""}${
    fullWidth ? " flex-1" : ""
  }`;
  const { items, addProduct, removeProduct, incrementQuantity, decrementQuantity } = useBasketStore(
    useShallow((state) => ({
      items: state.items,
      addProduct: state.addProduct,
      removeProduct: state.removeProduct,
      incrementQuantity: state.incrementQuantity,
      decrementQuantity: state.decrementQuantity,
    }))
  );

  const basketItem = items.find((item: any) => item.productId === productId);
  const isInBasket = !!basketItem;
  const storeQuantity = basketItem?.quantity || 0;
  const quantity = displayQuantity !== undefined ? displayQuantity : storeQuantity;

  const handleAdd = () => {
    addProduct(productId);
  };

  const handleIncrement = () => {
    if (maxQuantity !== undefined && quantity >= maxQuantity) return;
    incrementQuantity(productId);
  };

  const handleDecrement = () => {
    if (isBasketPage) {
      // On basket page, decrement capped at 1
      if (quantity > 1) {
        decrementQuantity(productId);
      }
    } else {
      // On product page, decrement to 0 removes item
      decrementQuantity(productId);
    }
  };

  const handleRemove = () => {
    removeProduct(productId);
  };

  if (!isInBasket) {
    return (
      <button
        onClick={handleAdd}
        data-testid={`add-to-basket-${productId}`}
        type="button"
        className={addClassName || "btn-cart"}
      >
        <ShoppingCart size={addClassName ? 14 : 16} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center ${fullWidth ? "w-full" : ""} ${wrapperClassName || ""}`}>
      <div className={`flex items-center ${fullWidth ? "w-full" : ""}`}>
        <button
          onClick={handleDecrement}
          data-testid={`decrement-${productId}`}
          type="button"
          disabled={isBasketPage && quantity <= 1}
          className={`${stepperCellClass} rounded-l-sm border-r-0`}
        >
          −
        </button>
        <span data-testid="quantity-display" className={`${stepperCellClass} border-r-0 border-l-0`}>{quantity}</span>
        <button
          onClick={handleIncrement}
          data-testid={`increment-${productId}`}
          type="button"
          disabled={maxQuantity !== undefined && quantity >= maxQuantity}
          className={`${stepperCellClass} border-l-0 rounded-r-sm`}
        >
          +
        </button>
      </div>
      {isBasketPage && showRemoveButton !== false && (
        <button
          onClick={handleRemove}
          data-testid={`remove-${productId}`}
          type="button"
          className={removeClassName || "ml-3 text-text-caption hover:text-text-secondary transition-colors duration-150 text-small"}
        >
          Remove
        </button>
      )}
    </div>
  );
}
