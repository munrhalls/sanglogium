import { describe, it, expect, beforeEach } from 'vitest';
import { useBasketStore } from '@/store/store';

describe('Basket Quantity Validation', () => {
  beforeEach(() => {
    // Reset store before each test
    useBasketStore.setState({ basket: [] });
  });

  const baseItem = {
    _id: 'item-1',
    name: 'Stock Limited Item',
    displayPrice: 100,
    stock: 5, // Limited stock
    quantity: 1,
    image: 'test.jpg',
    slug: 'stock-limited-item',
  };

  describe('updateQuantity', () => {
    it('should clamp quantity to available stock when incrementing past limit', () => {
      // 1. Setup: Item is in basket with quantity 1
      useBasketStore.getState().addItem({ ...baseItem });

      // 2. Action: Update quantity to 10 (exceeds stock of 5)
      useBasketStore.getState().updateQuantity('item-1', 10);

      // 3. Assertion: Quantity should be exactly 5
      const basket = useBasketStore.getState().basket;
      const item = basket.find((i) => i._id === 'item-1');
      expect(item?.quantity).toBe(5);
    });

    it('should maintain quantity at 1 if updated to 0 or negative', () => {
      useBasketStore.getState().addItem({ ...baseItem });
      useBasketStore.getState().updateQuantity('item-1', 0);
      
      const item = useBasketStore.getState().basket[0];
      expect(item.quantity).toBe(1);
    });
  });

  describe('addItem', () => {
    it('should clamp initial quantity to stock when adding more than available', () => {
      // Action: Add item with quantity 10 but stock 5
      useBasketStore.getState().addItem({ ...baseItem, quantity: 10 });

      // Assertion: Added with quantity 5
      const item = useBasketStore.getState().basket[0];
      expect(item.quantity).toBe(5);
    });

    it('should clamp total quantity when incrementing existing item past stock', () => {
      // 1. Setup: Already have 3 in basket
      useBasketStore.getState().addItem({ ...baseItem, quantity: 3 });

      // 2. Action: Try to add 4 more (total 7, but stock 5)
      useBasketStore.getState().addItem({ ...baseItem, quantity: 4 });

      // 3. Assertion: Clamped to 5
      const item = useBasketStore.getState().basket[0];
      expect(item.quantity).toBe(5);
    });
  });
});
