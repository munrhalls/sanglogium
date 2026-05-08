"use client";

import { useShallow } from 'zustand/shallow';
import useBasketStore from "@/store/basketStore";

interface BasketControlsProps {
  productId: string;
  isBasketPage: boolean;
  addClassName?: string;
  removeClassName?: string;
  decrementClassName?: string;
  incrementClassName?: string;
  quantityClassName?: string;
  wrapperClassName?: string;
}

export function BasketControls({
  productId,
  isBasketPage,
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
  const quantity = basketItem?.quantity || 0;

  const handleAdd = () => {
    addProduct(productId);
  };

  const handleIncrement = () => {
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
        className={addClassName}
      >
        Add
      </button>
    );
  }

  return (
    <div className={wrapperClassName}>
      {isBasketPage && (
        <button
          onClick={handleRemove}
          data-testid={`remove-${productId}`}
          type="button"
          className={removeClassName}
        >
          Remove
        </button>
      )}
      <button
        onClick={handleDecrement}
        data-testid={`decrement-${productId}`}
        type="button"
        disabled={isBasketPage && quantity <= 1}
        className={decrementClassName}
      >
        -
      </button>
      <span data-testid="quantity-display" className={quantityClassName}>{quantity}</span>
      <button
        onClick={handleIncrement}
        data-testid={`increment-${productId}`}
        type="button"
        className={incrementClassName}
      >
        +
      </button>
    </div>
  );
}
