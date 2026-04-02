import { describe, it, expect, beforeEach } from 'vitest';
import {
  selectBasketTotal,
  selectBasketCount,
  selectIsCheckoutEnabled,
  selectHasHydrated,
} from '@/store/store';
import { BasketItem } from '@/app/(store)/basket/basket.types';

// Mock state factory
const createMockState = (overrides: Partial<{ basket: BasketItem[]; _hasHydrated: boolean }> = {}) => ({
  basket: [],
  _hasHydrated: false,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearBasket: () => {},
  ...overrides,
});

const mockItem = (overrides: Partial<BasketItem> = {}): BasketItem => ({
  _id: 'item-1',
  name: 'Test Item',
  displayPrice: 100,
  stock: 10,
  quantity: 2,
  image: 'https://example.com/image.jpg',
  slug: 'test-item',
  ...overrides,
});

describe('Store Selectors', () => {
  describe('selectBasketTotal', () => {
    it('calculates correct sum of displayPrice × quantity', () => {
      const state = createMockState({
        basket: [
          mockItem({ _id: '1', displayPrice: 100, quantity: 2 }),
          mockItem({ _id: '2', displayPrice: 50, quantity: 3 }),
        ],
      });
      expect(selectBasketTotal(state)).toBe(350); // 100*2 + 50*3 = 350
    });

    it('returns 0 for empty basket', () => {
      const state = createMockState({ basket: [] });
      expect(selectBasketTotal(state)).toBe(0);
    });
  });

  describe('selectBasketCount', () => {
    it('returns correct sum of quantities', () => {
      const state = createMockState({
        basket: [
          mockItem({ _id: '1', quantity: 2 }),
          mockItem({ _id: '2', quantity: 3 }),
        ],
      });
      expect(selectBasketCount(state)).toBe(5);
    });

    it('returns 0 for empty basket', () => {
      const state = createMockState({ basket: [] });
      expect(selectBasketCount(state)).toBe(0);
    });
  });

  describe('selectIsCheckoutEnabled', () => {
    it('returns false when basket is empty', () => {
      const state = createMockState({ basket: [] });
      expect(selectIsCheckoutEnabled(state)).toBe(false);
    });

    it('returns true when basket has valid items', () => {
      const state = createMockState({
        basket: [
          mockItem({ _id: '1', quantity: 1, stock: 5 }),
          mockItem({ _id: '2', quantity: 2, stock: 5 }),
        ],
      });
      expect(selectIsCheckoutEnabled(state)).toBe(true);
    });

    it('returns false when any item has stock=0', () => {
      const state = createMockState({
        basket: [
          mockItem({ _id: '1', quantity: 1, stock: 5 }),
          mockItem({ _id: '2', quantity: 1, stock: 0 }),
        ],
      });
      expect(selectIsCheckoutEnabled(state)).toBe(false);
    });

    it('returns false when any item has quantity=0', () => {
      const state = createMockState({
        basket: [
          mockItem({ _id: '1', quantity: 1, stock: 5 }),
          mockItem({ _id: '2', quantity: 0, stock: 5 }),
        ],
      });
      expect(selectIsCheckoutEnabled(state)).toBe(false);
    });
  });

  describe('selectHasHydrated', () => {
    it('returns _hasHydrated value', () => {
      expect(selectHasHydrated(createMockState({ _hasHydrated: true }))).toBe(true);
      expect(selectHasHydrated(createMockState({ _hasHydrated: false }))).toBe(false);
    });
  });
});
