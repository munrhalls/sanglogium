import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductInfo } from '@/app/components/features/products/ProductInfo';
import { useBasketStore } from '@/store/store';

// Mock urlFor to return a valid string
vi.mock('@/sanity/lib/image', () => ({
  urlFor: vi.fn().mockReturnValue({
    width: vi.fn().mockReturnThis(),
    height: vi.fn().mockReturnThis(),
    url: vi.fn().mockReturnValue('https://example.com/test.jpg')
  })
}));

const mockProduct = {
  _id: 'test-id',
  name: 'Test Product',
  displayPrice: 100,
  stock: 10,
  sku: 'TEST-SKU',
  slug: { current: 'test-product' },
  brand: { name: 'Test Brand' },
  overviewFields: [],
  image: { asset: { _ref: 'image-ref' } } // Provide an image object
};

describe('ProductInfo Basket Logic', () => {
  beforeEach(() => {
    act(() => {
      useBasketStore.getState().clearBasket();
    });
  });

  it('updates basketItem variable after adding to cart', async () => {
    // @ts-ignore
    render(<ProductInfo product={mockProduct} />);

    // Trigger handleAddToCart
    const addButton = screen.getByText(/Add to Cart/i);
    fireEvent.click(addButton);

    // Assert: "1 in Cart" should appear once basketItem is defined
    const inCartText = await screen.findByText(/1 in Cart/i);
    expect(inCartText).toBeDefined();
    
    // Explicitly check store state as well
    const state = useBasketStore.getState();
    const basketItem = state.basket.find(i => i._id === mockProduct._id);
    expect(basketItem).toBeDefined();
    expect(basketItem?.quantity).toBe(1);
  });
});
