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

  it('immediately updates UI to "in Cart" after adding a product', async () => {
    // @ts-ignore
    render(<ProductInfo product={mockProduct} />);

    // Trigger handleAddToCart
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    // Assert: "1 in Cart" should appear once the internal basketItem is defined
    // This confirms that ProductInfo has detected the addition.
    const inCartText = await screen.findByText(/1 in Cart/i);
    expect(inCartText).toBeInTheDocument();
    
    // Explicitly verify the "Add to cart" button is replaced
    expect(screen.queryByText(/add to cart/i)).toBeNull();
  });
});
