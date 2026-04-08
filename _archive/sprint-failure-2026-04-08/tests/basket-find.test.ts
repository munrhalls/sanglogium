import { describe, it, expect, beforeEach } from 'vitest';
import { useBasketStore, selectBasketItem } from '@/store/store';

describe('Basket Selection Logic', () => {
  beforeEach(() => {
    useBasketStore.getState().clearBasket();
  });

  it('finds a product in the basket correctly', () => {
    const product = {
      _id: 'test-product-id',
      name: 'Test Product',
      displayPrice: 100,
      stock: 10,
      quantity: 1,
      image: 'test-image.jpg',
      slug: 'test-product',
    };

    // Add the item to the store
    useBasketStore.getState().addItem(product);

    // The logic to test:
    const basketItem = selectBasketItem(product._id)(useBasketStore.getState());

    // Assertions
    expect(basketItem).toBeDefined();
    expect(basketItem?._id).toBe(product._id);

    // Negative test: Should not return product when it's not in the basket
    const otherItem = selectBasketItem('wrong-id')(useBasketStore.getState());
    expect(otherItem).toBeUndefined();
  });
});
