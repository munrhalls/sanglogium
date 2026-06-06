"use client";

import { useShallow } from 'zustand/shallow';
import { TrashIcon } from "@phosphor-icons/react";
import useBasketStore from "@/store/basketStore";

interface BasketControlsProps {
  productId: string;
  name?: string;
  isBasketPage: boolean;
  maxQuantity?: number;
  displayQuantity?: number;
  addClassName?: string;
  removeClassName?: string;
  decrementClassName?: string;
  incrementClassName?: string;
  quantityClassName?: string;
  wrapperClassName?: string;
}

export function BasketControls({
  productId,
  name,
  isBasketPage,
  maxQuantity,
  displayQuantity,
  addClassName,
  removeClassName,
  decrementClassName,
  incrementClassName,
  quantityClassName,
  wrapperClassName,
}: BasketControlsProps) {
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
        Add
      </button>
    );
  }

  return (
    <div className={`flex items-center ${wrapperClassName || ""}`}>
      <div className="flex items-center">
        <button
          onClick={handleDecrement}
          data-testid={`decrement-${productId}`}
          type="button"
          disabled={isBasketPage && quantity <= 1}
          className={decrementClassName || "h-10 w-10 flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-l-sm border-r-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"}
        >
          −
        </button>
        <span data-testid="quantity-display" className={quantityClassName || "h-10 w-10 flex items-center justify-center bg-surface-elevated border-y border-border-secondary type-card-title tabular-nums select-none"}>{quantity}</span>
        <button
          onClick={handleIncrement}
          data-testid={`increment-${productId}`}
          type="button"
          disabled={maxQuantity !== undefined && quantity >= maxQuantity}
          className={incrementClassName || "h-10 w-10 flex items-center justify-center bg-surface-elevated border border-border-secondary rounded-r-sm border-l-0 text-text-secondary hover:border-border-primary hover:text-text-primary transition-colors duration-150"}
        >
          +
        </button>
      </div>
      {isBasketPage && (
        <button
          onClick={handleRemove}
          data-testid={`remove-${productId}`}
          type="button"
          aria-label={name ? `Remove ${name} from basket` : "Remove from basket"}
          className={removeClassName || "ml-3 h-10 w-10 flex items-center justify-center text-text-caption hover:text-error-500 transition-colors duration-150 rounded-sm"}
        >
          <TrashIcon size={18} />
        </button>
      )}
    </div>
  );
}
