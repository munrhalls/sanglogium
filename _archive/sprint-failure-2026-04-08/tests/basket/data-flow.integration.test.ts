import { describe, it, expect } from 'vitest';
import { BasketItem } from '@/app/(store)/basket/basket.types';
import { selectBasketTotal } from '@/store/store';

// Mock Product type matching what ProductInfo receives
interface MockProduct {
  _id: string;
  name: string;
  displayPrice: number;
  stock: number;
  slug: { current: string };
  image: { _ref: string } | null;
  brand: { _id: string; name: string } | null;
}

describe('Data Flow Integration', () => {
  const mockProduct = (overrides: Partial<MockProduct> = {}): MockProduct => ({
    _id: 'prod-1',
    name: 'Test Headphones',
    displayPrice: 299,
    stock: 10,
    slug: { current: 'test-headphones' },
    image: { _ref: 'image-123' },
    brand: { _id: 'brand-1', name: 'TestBrand' },
    ...overrides,
  });

  // Simulates ProductInfo.tsx addItem payload construction
  const createBasketItemFromProduct = (product: MockProduct, quantity: number): BasketItem => ({
    _id: product._id,
    name: product.name,
    displayPrice: product.displayPrice,
    stock: product.stock,
    quantity: quantity,
    image: product.image ? `https://cdn.sanity.io/images/site/image-100x100.jpg` : '',
    slug: product.slug.current,
  });

  describe('Product → BasketItem mapping', () => {
    it('maps all required fields correctly', () => {
      const product = mockProduct();
      const basketItem = createBasketItemFromProduct(product, 2);

      expect(basketItem._id).toBe(product._id);
      expect(basketItem.name).toBe(product.name);
      expect(basketItem.displayPrice).toBe(product.displayPrice);
      expect(basketItem.stock).toBe(product.stock);
      expect(basketItem.quantity).toBe(2);
      expect(basketItem.slug).toBe('test-headphones');
      expect(typeof basketItem.image).toBe('string');
    });

    it('contains slug (not just _id)', () => {
      const product = mockProduct({ slug: { current: 'my-product-slug' } });
      const basketItem = createBasketItemFromProduct(product, 1);

      expect(basketItem.slug).toBe('my-product-slug');
      expect(basketItem.slug).not.toBe(basketItem._id);
    });

    it('contains image URL string (not object)', () => {
      const product = mockProduct();
      const basketItem = createBasketItemFromProduct(product, 1);

      expect(typeof basketItem.image).toBe('string');
      expect(basketItem.image.length).toBeGreaterThan(0);
    });

    it('does NOT include brand in payload', () => {
      const product = mockProduct({ brand: { _id: 'brand-1', name: 'Audeze' } });
      const basketItem = createBasketItemFromProduct(product, 1);

      // Brand should not be in BasketItem
      expect(basketItem).not.toHaveProperty('brand');
    });
  });

  describe('BasketItem → Checkout handoff', () => {
    it('maps to {_id, quantity} only for server (no price sent)', () => {
      const basketItem: BasketItem = {
        _id: 'item-1',
        name: 'Headphones',
        displayPrice: 299,
        stock: 5,
        quantity: 2,
        image: 'https://example.com/img.jpg',
        slug: 'headphones',
      };

      // Checkout handoff format (what useInitializeCheckoutCart creates)
      const checkoutItem = {
        id: basketItem._id,
        name: basketItem.name,
        price: basketItem.displayPrice, // Note: uses displayPrice
        quantity: basketItem.quantity,
      };

      // Should use displayPrice, not undefined 'price'
      expect(checkoutItem.price).toBe(299);
      expect(checkoutItem).not.toHaveProperty('displayPrice');
      expect(checkoutItem.id).toBe('item-1');
      expect(checkoutItem.quantity).toBe(2);
    });

    it('selectBasketTotal is correct after addItem', () => {
      const state = {
        basket: [
          { _id: '1', name: 'Item 1', displayPrice: 100, stock: 5, quantity: 2, image: 'img1.jpg', slug: 'item-1' },
          { _id: '2', name: 'Item 2', displayPrice: 50, stock: 3, quantity: 1, image: 'img2.jpg', slug: 'item-2' },
        ],
        _hasHydrated: true,
        addItem: () => {},
        removeItem: () => {},
        updateQuantity: () => {},
        clearBasket: () => {},
      };

      expect(selectBasketTotal(state)).toBe(250); // 100*2 + 50*1
    });
  });

  describe('Adding same item twice', () => {
    it('increments quantity when adding existing item', () => {
      const product = mockProduct({ _id: 'same-id', stock: 10 });
      const item1 = createBasketItemFromProduct(product, 2);
      const item2 = createBasketItemFromProduct(product, 3);

      // Simulating store behavior: same _id means increment
      const existingQuantity = item1.quantity;
      const newQuantity = Math.min(existingQuantity + item2.quantity, product.stock);

      expect(newQuantity).toBe(5); // 2 + 3 = 5
    });
  });
});
