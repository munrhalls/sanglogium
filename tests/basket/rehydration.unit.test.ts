import { describe, it, expect } from 'vitest';
import { BasketItem } from '@/app/(store)/basket/basket.types';

describe('Rehydration Logic', () => {
  // Migration function extracted from store for testing
  const migrate = (persistedState: unknown): { basket: BasketItem[]; _hasHydrated: boolean } => {
    if (!persistedState || typeof persistedState !== 'object') {
      return { basket: [], _hasHydrated: false };
    }
    const state = persistedState as { basket?: unknown[] };
    if (!state.basket || !Array.isArray(state.basket)) {
      return { basket: [], _hasHydrated: false };
    }
    const migratedBasket = state.basket.map((item: unknown) => {
      if (!item || typeof item !== 'object') return null;
      const i = item as Record<string, unknown>;
      return {
        _id: String(i._id || ""),
        name: String(i.name || ""),
        displayPrice: typeof i.displayPrice === 'number' ? i.displayPrice : typeof i.price === 'number' ? i.price : 0,
        stock: typeof i.stock === 'number' ? i.stock : 0,
        quantity: typeof i.quantity === 'number' ? i.quantity : 1,
        image: String(i.image || ""),
        slug: String(i.slug || i._id || ""),
      };
    }).filter((item): item is BasketItem => item !== null && item._id !== "");
    return { basket: migratedBasket, _hasHydrated: false };
  };

  // Validation function extracted from store for testing
  const validateItems = (items: BasketItem[]): BasketItem[] => {
    return items.filter((item) => {
      return (
        item &&
        typeof item._id === 'string' &&
        item._id !== '' &&
        typeof item.name === 'string' &&
        typeof item.displayPrice === 'number' &&
        typeof item.image === 'string' &&
        item.image !== '' &&
        typeof item.slug === 'string' &&
        item.slug !== ''
      );
    });
  };

  describe('Migration', () => {
    it('migrates version 0 data: price -> displayPrice', () => {
      const oldState = {
        basket: [
          { _id: '1', name: 'Item 1', price: 100, stock: 5, quantity: 2, image: 'img1.jpg' },
        ],
      };
      const result = migrate(oldState);
      expect(result.basket[0].displayPrice).toBe(100);
    });

    it('adds slug fallback from _id when missing', () => {
      const oldState = {
        basket: [
          { _id: 'item-123', name: 'Item', displayPrice: 50, stock: 5, quantity: 1, image: 'img.jpg' },
        ],
      };
      const result = migrate(oldState);
      expect(result.basket[0].slug).toBe('item-123');
    });

    it('handles corrupted localStorage gracefully', () => {
      expect(migrate(null)).toEqual({ basket: [], _hasHydrated: false });
      expect(migrate(undefined)).toEqual({ basket: [], _hasHydrated: false });
      expect(migrate('invalid')).toEqual({ basket: [], _hasHydrated: false });
      expect(migrate({})).toEqual({ basket: [], _hasHydrated: false });
    });

    it('filters out items with missing _id', () => {
      const state = {
        basket: [
          { _id: '', name: 'Invalid', displayPrice: 10, stock: 5, quantity: 1, image: 'img.jpg', slug: 'test' },
          { _id: 'valid', name: 'Valid', displayPrice: 20, stock: 5, quantity: 1, image: 'img.jpg', slug: 'valid' },
        ],
      };
      const result = migrate(state);
      expect(result.basket).toHaveLength(1);
      expect(result.basket[0]._id).toBe('valid');
    });
  });

  describe('Validation', () => {
    it('filters out items with missing _id', () => {
      const items: BasketItem[] = [
        { _id: '', name: 'Invalid', displayPrice: 10, stock: 5, quantity: 1, image: 'img.jpg', slug: 'test' },
        { _id: 'valid', name: 'Valid', displayPrice: 20, stock: 5, quantity: 1, image: 'img.jpg', slug: 'valid' },
      ];
      expect(validateItems(items)).toHaveLength(1);
    });

    it('filters out items with non-number displayPrice', () => {
      const items = [
        { _id: '1', name: 'Invalid', displayPrice: '100', stock: 5, quantity: 1, image: 'img.jpg', slug: 'test' },
        { _id: '2', name: 'Valid', displayPrice: 100, stock: 5, quantity: 1, image: 'img.jpg', slug: 'valid' },
      ] as BasketItem[];
      const valid = validateItems(items);
      expect(valid).toHaveLength(1);
      expect(valid[0]._id).toBe('2');
    });

    it('filters out items with missing image', () => {
      const items = [
        { _id: '1', name: 'Invalid', displayPrice: 100, stock: 5, quantity: 1, image: '', slug: 'test' },
        { _id: '2', name: 'Valid', displayPrice: 100, stock: 5, quantity: 1, image: 'img.jpg', slug: 'valid' },
      ] as BasketItem[];
      const valid = validateItems(items);
      expect(valid).toHaveLength(1);
      expect(valid[0]._id).toBe('2');
    });

    it('returns all valid items', () => {
      const items: BasketItem[] = [
        { _id: '1', name: 'Item 1', displayPrice: 100, stock: 5, quantity: 1, image: 'img1.jpg', slug: 'item-1' },
        { _id: '2', name: 'Item 2', displayPrice: 200, stock: 3, quantity: 2, image: 'img2.jpg', slug: 'item-2' },
      ];
      expect(validateItems(items)).toHaveLength(2);
    });
  });
});
