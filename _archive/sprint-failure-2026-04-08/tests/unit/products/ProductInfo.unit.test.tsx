import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductInfo } from '@/app/components/features/products/ProductInfo';
import { useBasketStore } from '@/store/store';

// Mock urlFor (Sanity image helper)
vi.mock('@/sanity/lib/image', () => ({
  urlFor: vi.fn(() => ({
    width: vi.fn().mockReturnThis(),
    height: vi.fn().mockReturnThis(),
    url: vi.fn().mockReturnValue('test-url'),
  })),
}));

// Mock phosphor icons to avoid SSR issues or long selectors
vi.mock('@phosphor-icons/react/dist/ssr', () => ({
  ShoppingCartIcon: () => <div data-testid="shopping-cart-icon" />,
  CheckIcon: () => <div data-testid="check-icon" />,
}));

const mockProduct = {
  _id: 'prod-1',
  name: 'Test Product',
  displayPrice: 99.99,
  stock: 10,
  sku: 'TEST-SKU',
  brand: { name: 'Test Brand' },
  slug: { current: 'test-product' },
  overviewFields: [],
};

describe('ProductInfo', () => {
  beforeEach(() => {
    // Reset store before each test
    useBasketStore.setState({ basket: [] });
  });

  it('decrementing when quantity === 1 should result in removing item (isInBasket being 0)', async () => {
    // 1. Setup store with the product in basket at quantity 1
    useBasketStore.setState({
      basket: [{
        _id: 'prod-1',
        name: 'Test Product',
        displayPrice: 99.99,
        stock: 10,
        quantity: 1,
        image: 'test-img',
        slug: 'test-product',
      }]
    });

    render(<ProductInfo product={mockProduct as any} />);

    // Verify item is initially in basket (should show "In cart:" UI)
    expect(screen.getByText(/In cart:/i)).toBeInTheDocument();

    // 2. Find decrement button (Decrease quantity)
    const decrementBtn = screen.getByLabelText(/Decrease quantity/i);
    
    // 3. Click decrement
    // Note: If the button is disabled due to min={1}, fireEvent.click will still trigger 
    // the event in JSDOM unless explicitly handled, but it mimics the user interaction logic.
    fireEvent.click(decrementBtn);

    // 4. Assert that the item is no longer in the basket
    const basket = useBasketStore.getState().basket;
    const itemInBasket = basket.find(i => i._id === 'prod-1');
    expect(itemInBasket).toBeUndefined();
    
    // Also verify UI toggle back to "Quantity:" view
    expect(screen.queryByText(/In cart:/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Quantity:/i)).toBeInTheDocument();
  });
});
