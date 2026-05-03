"use client";

import useBasketStore, { selectItems } from "@/store/basketStore";

interface BasketControlsProps {
  productId: string;
  displayPriceAtAdd: number;
  availableStockAtAdd: number;
  isBasketPage: boolean;
}

export function BasketControls({
  productId,
  displayPriceAtAdd,
  availableStockAtAdd,
  isBasketPage,
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
        data-testid="add-button"
        type="button"
      >
        Add
      </button>
    );
  }

  return (
    <div>
      {isBasketPage && (
        <button
          onClick={handleRemove}
          data-testid="remove-button"
          type="button"
        >
          Remove
        </button>
      )}
      <button
        onClick={handleDecrement}
        data-testid="decrement-button"
        type="button"
        disabled={isBasketPage && quantity <= 1}
      >
        -
      </button>
      <span data-testid="quantity-display">{quantity}</span>
      <button
        onClick={handleIncrement}
        data-testid="increment-button"
        type="button"
      >
        +
      </button>
    </div>
  );
}
