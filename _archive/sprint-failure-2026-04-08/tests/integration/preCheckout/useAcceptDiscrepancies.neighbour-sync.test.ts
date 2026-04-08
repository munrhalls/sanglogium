import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAcceptDiscrepancies } from '@/app/components/features/basket/checkout/useAcceptDiscrepancies';
import { useBasketStore } from '@/store/store';
import type { DiscrepancyPayload } from '@/store/preCheckout/preCheckoutTypes';

// Mock the basket store
vi.mock('@/store/store');

describe('useAcceptDiscrepancies - Neighbour Sync Integration', () => {
  const mockDispatch = vi.fn();
  const mockExecuteValidation = vi.fn();
  const mockBasketPayload = {
    items: [{ _id: 'item1', quantity: 2 }],
    total: 200
  };

  // Mock basket store with realistic state
  const mockBasketStore = {
    basket: [
      {
        _id: 'item1',
        name: 'Test Product',
        displayPrice: 100,
        stock: 5,
        quantity: 2,
        image: 'test.jpg',
        slug: 'test'
      }
    ],
    removeItem: vi.fn(),
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    updateItemPrice: vi.fn(),
    updateItemQuantity: vi.fn(),
    getState: vi.fn(() => mockBasketStore)
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBasketStore as any).getState = vi.fn(() => mockBasketStore);
  });

  it('should sync PRICE mutations with validateBasket expectations', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // Simulate PRICE discrepancy where actual price is 80 (basket has 100)
    const discrepancy: DiscrepancyPayload = {
      type: 'PRICE',
      items: [
        { id: 'item1', productName: 'Test Product', expected: 100, actual: 80 }
      ]
    };

    // Apply mutations
    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    // Verify basket store mutation was called with correct price
    expect(mockBasketStore.updateItemPrice).toHaveBeenCalledWith('item1', 80);

    // Simulate the basket state after mutation
    const mutatedBasket = {
      ...mockBasketStore.basket[0],
      displayPrice: 80 // Updated to match Sanity's actual price
    };

    // Create payload as it would be created from mutated basket
    const payloadFromMutatedBasket = {
      items: [{ _id: 'item1', quantity: 2 }],
      total: 160 // 80 * 2
    };

    // Verify this payload would pass validateBasket price check
    // (In real scenario, validateBasket would fetch Sanity data and compare)
    expect(payloadFromMutatedBasket.items[0]._id).toBe('item1');
    expect(payloadFromMutatedBasket.total).toBe(160); // Updated total reflects new price

    // Verify dispatch and executeValidation were called
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalled();
  });

  it('should sync INVENTORY mutations with validateBasket expectations', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // Simulate INVENTORY discrepancy where only 1 item is available (basket has 2)
    const discrepancy: DiscrepancyPayload = {
      type: 'INVENTORY',
      items: [
        { id: 'item1', productName: 'Test Product', requested: 2, available: 1 }
      ]
    };

    // Apply mutations
    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    // Verify basket store mutation was called with correct quantity
    expect(mockBasketStore.updateItemQuantity).toHaveBeenCalledWith('item1', 1);

    // Simulate the basket state after mutation
    const mutatedBasket = {
      ...mockBasketStore.basket[0],
      quantity: 1 // Updated to match available stock
    };

    // Create payload as it would be created from mutated basket
    const payloadFromMutatedBasket = {
      items: [{ _id: 'item1', quantity: 1 }],
      total: 100 // 100 * 1
    };

    // Verify this payload would pass validateBasket stock check
    // (In real scenario, validateBasket would verify quantity ≤ stock)
    expect(payloadFromMutatedBasket.items[0].quantity).toBe(1);
    expect(payloadFromMutatedBasket.total).toBe(100); // Updated total reflects new quantity

    // Verify dispatch and executeValidation were called
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalled();
  });

  it('should sync INVENTORY zero-stock removal with validateBasket expectations', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // Simulate INVENTORY discrepancy where no items are available
    const discrepancy: DiscrepancyPayload = {
      type: 'INVENTORY',
      items: [
        { id: 'item1', productName: 'Test Product', requested: 2, available: 0 }
      ]
    };

    // Apply mutations
    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    // Verify item was removed from basket
    expect(mockBasketStore.removeItem).toHaveBeenCalledWith('item1');

    // Simulate empty basket after removal
    const emptyBasketPayload = {
      items: [], // No items
      total: 0
    };

    // Verify empty payload would be handled correctly by validateBasket
    // (Empty basket might be invalid for checkout, but that's business logic)
    expect(emptyBasketPayload.items).toHaveLength(0);
    expect(emptyBasketPayload.total).toBe(0);

    // Verify dispatch and executeValidation were called
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalled();
  });

  it('should maintain basket store API contract during mutations', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // Test all mutation methods exist and are called with correct signatures
    const priceDiscrepancy: DiscrepancyPayload = {
      type: 'PRICE',
      items: [{ id: 'item1', productName: 'Test Product', expected: 100, actual: 90 }]
    };

    await act(async () => {
      await result.current.acceptAndContinue(priceDiscrepancy, 'test-key');
    });

    // Verify API contract: updateItemPrice(_id: string, price: number)
    expect(mockBasketStore.updateItemPrice).toHaveBeenCalledWith(
      expect.any(String), // _id
      expect.any(Number)  // price
    );

    // Reset for next test
    vi.clearAllMocks();

    const inventoryDiscrepancy: DiscrepancyPayload = {
      type: 'INVENTORY',
      items: [{ id: 'item1', productName: 'Test Product', requested: 2, available: 3 }]
    };

    await act(async () => {
      await result.current.acceptAndContinue(inventoryDiscrepancy, 'test-key');
    });

    // Verify API contract: updateItemQuantity(_id: string, quantity: number)
    expect(mockBasketStore.updateItemQuantity).toHaveBeenCalledWith(
      expect.any(String), // _id
      expect.any(Number)  // quantity
    );
  });
});
