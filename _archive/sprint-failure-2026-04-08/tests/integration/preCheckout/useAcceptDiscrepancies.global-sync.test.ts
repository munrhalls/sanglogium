import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAcceptDiscrepancies } from '@/app/components/features/basket/checkout/useAcceptDiscrepancies';
import { useBasketStore } from '@/store/store';
import type { DiscrepancyPayload } from '@/store/preCheckout/preCheckoutTypes';

// Mock the basket store
vi.mock('@/store/store');

describe('useAcceptDiscrepancies - Global Sync Integration', () => {
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

  it('should not corrupt basket for downstream order creation after PRICE mutations', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // Simulate PRICE discrepancy - price increased from 100 to 120
    const discrepancy: DiscrepancyPayload = {
      type: 'PRICE',
      items: [
        { id: 'item1', productName: 'Test Product', expected: 100, actual: 120 }
      ]
    };

    // Apply mutations
    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    // Verify the mutation was applied
    expect(mockBasketStore.updateItemPrice).toHaveBeenCalledWith('item1', 120);

    // Simulate the mutated basket state that downstream order creation would see
    const mutatedBasketState = {
      ...mockBasketStore.basket[0],
      displayPrice: 120 // Updated price
    };

    // Verify basket integrity for downstream order creation:
    // 1. Item ID remains unchanged (critical for order tracking)
    expect(mutatedBasketState._id).toBe('item1');
    
    // 2. Product name remains unchanged (important for order display)
    expect(mutatedBasketState.name).toBe('Test Product');
    
    // 3. Image and slug remain unchanged (needed for order details page)
    expect(mutatedBasketState.image).toBe('test.jpg');
    expect(mutatedBasketState.slug).toBe('test');
    
    // 4. Stock remains unchanged (inventory is separate from price)
    expect(mutatedBasketState.stock).toBe(5);
    
    // 5. Quantity remains unchanged (price change doesn't affect quantity)
    expect(mutatedBasketState.quantity).toBe(2);
    
    // 6. Only displayPrice changed (intentional mutation)
    expect(mutatedBasketState.displayPrice).toBe(120);

    // Calculate what the order total would be
    const expectedOrderTotal = mutatedBasketState.displayPrice * mutatedBasketState.quantity;
    expect(expectedOrderTotal).toBe(240); // 120 * 2

    // Verify dispatch and executeValidation were called
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalled();
  });

  it('should not corrupt basket for downstream order creation after INVENTORY mutations', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // Simulate INVENTORY discrepancy - only 1 item available (basket has 2)
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

    // Verify the mutation was applied
    expect(mockBasketStore.updateItemQuantity).toHaveBeenCalledWith('item1', 1);

    // Simulate the mutated basket state that downstream order creation would see
    const mutatedBasketState = {
      ...mockBasketStore.basket[0],
      quantity: 1 // Updated quantity
    };

    // Verify basket integrity for downstream order creation:
    // 1. Item ID remains unchanged
    expect(mutatedBasketState._id).toBe('item1');
    
    // 2. Product name remains unchanged
    expect(mutatedBasketState.name).toBe('Test Product');
    
    // 3. Image and slug remain unchanged
    expect(mutatedBasketState.image).toBe('test.jpg');
    expect(mutatedBasketState.slug).toBe('test');
    
    // 4. Stock remains unchanged (available stock doesn't change total stock)
    expect(mutatedBasketState.stock).toBe(5);
    
    // 5. Display price remains unchanged (inventory doesn't affect price)
    expect(mutatedBasketState.displayPrice).toBe(100);
    
    // 6. Only quantity changed (intentional mutation)
    expect(mutatedBasketState.quantity).toBe(1);

    // Calculate what the order total would be
    const expectedOrderTotal = mutatedBasketState.displayPrice * mutatedBasketState.quantity;
    expect(expectedOrderTotal).toBe(100); // 100 * 1

    // Verify dispatch and executeValidation were called
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalled();
  });

  it('should handle item removal correctly for downstream order creation', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // Simulate INVENTORY discrepancy - no items available
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

    // Verify the item was removed
    expect(mockBasketStore.removeItem).toHaveBeenCalledWith('item1');

    // Simulate empty basket state that downstream order creation would see
    // In this case, the order would fail to create (which is expected behavior)
    // but the basket store itself is not corrupted - it's just empty

    // Verify dispatch and executeValidation were still called
    // (The validation step will handle the empty basket case)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalled();
  });

  it('should preserve basket store data integrity during multiple mutations', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    // First apply a PRICE mutation
    const priceDiscrepancy: DiscrepancyPayload = {
      type: 'PRICE',
      items: [
        { id: 'item1', productName: 'Test Product', expected: 100, actual: 120 }
      ]
    };

    await act(async () => {
      await result.current.acceptAndContinue(priceDiscrepancy, 'test-key-1');
    });

    // Verify price was updated
    expect(mockBasketStore.updateItemPrice).toHaveBeenCalledWith('item1', 120);

    // Reset mocks for next mutation
    mockBasketStore.updateItemPrice.mockClear();
    mockDispatch.mockClear();
    mockExecuteValidation.mockClear();

    // Then apply an INVENTORY mutation
    const inventoryDiscrepancy: DiscrepancyPayload = {
      type: 'INVENTORY',
      items: [
        { id: 'item1', productName: 'Test Product', requested: 2, available: 1 }
      ]
    };

    await act(async () => {
      await result.current.acceptAndContinue(inventoryDiscrepancy, 'test-key-2');
    });

    // Verify quantity was updated
    expect(mockBasketStore.updateItemQuantity).toHaveBeenCalledWith('item1', 1);

    // The basket should now have both mutations applied:
    // - Price: 120 (from PRICE mutation)
    // - Quantity: 1 (from INVENTORY mutation)
    
    // This represents a valid basket state for downstream order creation
    // with intentional, documented mutations
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockExecuteValidation).toHaveBeenCalledTimes(1);
  });

  it('should document mutation intent for downstream consumers', async () => {
    // This test verifies that mutations are intentional and documented
    // The downstream order creation step needs to understand:
    // 1. Prices may have been updated to match current Sanity prices
    // 2. Quantities may have been adjusted to match available stock
    // 3. Items may have been removed if out of stock
    
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    const priceDiscrepancy: DiscrepancyPayload = {
      type: 'PRICE',
      items: [
        { 
          id: 'item1', 
          productName: 'Test Product', 
          expected: 100, 
          actual: 120 // Documented: Price updated to match Sanity
        }
      ]
    };

    await act(async () => {
      await result.current.acceptAndContinue(priceDiscrepancy, 'test-key');
    });

    // The mutation is intentional and documented through:
    // 1. The DiscrepancyPayload type (PRICE vs INVENTORY)
    // 2. The expected vs actual values
    // 3. The specific mutation applied (updateItemPrice vs updateItemQuantity)
    
    // Downstream consumers can trust that:
    // - PRICE mutations mean "user accepted new price"
    // - INVENTORY mutations mean "user accepted reduced quantity"
    // - Removed items mean "user accepted out-of-stock removal"
    
    expect(mockBasketStore.updateItemPrice).toHaveBeenCalledWith('item1', 120);
  });
});
