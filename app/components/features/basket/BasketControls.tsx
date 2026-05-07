"use client";

import useBasketStore, { selectItems } from "@/store/basketStore";

interface BasketControlsProps {
  productId: string;
  displayPriceAtAdd: number;
  availableStockAtAdd: number;
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
  displayPriceAtAdd,
  availableStockAtAdd,
  isBasketPage,
  addClassName,
  removeClassName,
  decrementClassName,
  incrementClassName,
  quantityClassName,
  wrapperClassName,
}: BasketControlsProps) {
  const items = useBasketStore(selectItems);
  const store = useBasketStore();

  const basketItem = items.find((item: any) => item.productId === productId);
  const isInBasket = !!basketItem;
  const quantity = basketItem?.quantity || 0;

  const handleAdd = () => {
    store.addProduct(productId, displayPriceAtAdd, availableStockAtAdd);
  };

  const handleIncrement = () => {
    store.incrementQuantity(productId);
  };

  const handleDecrement = () => {
    if (isBasketPage) {
      // On basket page, decrement capped at 1
      if (quantity > 1) {
        store.decrementQuantity(productId);
      }
    } else {
      // On product page, decrement to 0 removes item
      store.decrementQuantity(productId);
    }
  };

  const handleRemove = () => {
    store.removeProduct(productId);
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
        disabled={quantity >= availableStockAtAdd}
        className={incrementClassName}
      >
        +
      </button>
    </div>
  );
}
