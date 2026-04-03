import { describe, it, expect, beforeEach } from 'vitest';
import { useBasketStore } from '@/store/store';

describe('useBasketStore Quantity Validation', () => {
  beforeEach(() => {
    useBasketStore.setState({ basket: [] });
  });

  const mockItem = {
    _id: 'test-id',
    name: 'Test Product',
    displayPrice: 100,
    stock: 5,
    quantity: 1,
    image: 'test.jpg',
    slug: 'test-product',
  };

  it('should not allow incrementing quantity past stock level', () => {
    // 1. Initial state: add item with quantity 1 (stock 5)
    useBasketStore.getState().addItem({ ...mockItem });

    // 2. Try to update quantity to 10
    useBasketStore.getState().updateQuantity('test-id', 10);

    // 3. Verify it is clamped to stock level (5)
    const basket = useBasketStore.getState().basket;
    const item = basket.find(i => i._id === 'test-id');

    expect(item?.quantity).toBe(5);
  });

  it('should not allow item to be added with quantity > stock', () => {
    // Try to add item with quantity 10 but stock 5
    useBasketStore.getState().addItem({ ...mockItem, quantity: 10 });

    const basket = useBasketStore.getState().basket;
    const item = basket.find(i => i._id === 'test-id');

    expect(item?.quantity).toBe(5);
  });

  it('should clamp total quantity when adding more of the same item', () => {
    // 1. Add 3 items
    useBasketStore.getState().addItem({ ...mockItem, quantity: 3 });

    // 2. Add 4 more items (total 7, but stock is 5)
    useBasketStore.getState().addItem({ ...mockItem, quantity: 4 });

    const basket = useBasketStore.getState().basket;
    const item = basket.find(i => i._id === 'test-id');

    expect(item?.quantity).toBe(5);
  });
});
