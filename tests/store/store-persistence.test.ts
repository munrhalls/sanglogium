import { describe, it, expect, beforeEach } from 'vitest';
import { useBasketStore } from '@/store/store';

describe('store persistence', () => {
  beforeEach(() => {
    useBasketStore.getState().clearBasket();
    localStorage.clear();
  });

  it('localStorage contains only _id and quantity', () => {
    const store = useBasketStore.getState();
    store.addItem({
      _id: 'test-id',
      name: 'Test Product',
      displayPrice: 100,
      stock: 10,
      quantity: 2,
      image: 'test.jpg',
      slug: 'test-slug',
    });

    const persisted = JSON.parse(localStorage.getItem('basket-storage') || '{}');
    const basketItem = persisted.state?.basket?.[0];

    // Only _id and quantity should be persisted
    expect(Object.keys(basketItem)).toEqual(['_id', 'quantity']);
    expect(basketItem._id).toBe('test-id');
    expect(basketItem.quantity).toBe(2);
    expect(basketItem.name).toBeUndefined();
    expect(basketItem.displayPrice).toBeUndefined();
    expect(basketItem.stock).toBeUndefined();
    expect(basketItem.image).toBeUndefined();
    expect(basketItem.slug).toBeUndefined();
  });
});
