import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAcceptDiscrepancies } from '@/app/components/features/basket/checkout/useAcceptDiscrepancies';
import { useBasketStore } from '@/store/store';
import type { DiscrepancyPayload } from '@/store/preCheckout/preCheckoutTypes';

// Mock the basket store
vi.mock('@/store/store');

// Mock console methods
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useAcceptDiscrepancies', () => {
  const mockDispatch = vi.fn();
  const mockExecuteValidation = vi.fn();
  const mockBasketPayload = {
    items: [{ _id: 'item1', quantity: 2 }],
    total: 100
  };

  const mockBasketStore = {
    basket: [
      { _id: 'item1', name: 'Test Item', displayPrice: 50, stock: 5, quantity: 2, image: 'test.jpg', slug: 'test' }
    ],
    removeItem: vi.fn(),
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    updateItemPrice: vi.fn(),
    updateItemQuantity: vi.fn(),
    getState: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBasketStore as any).getState = vi.fn(() => mockBasketStore);
    (useBasketStore as any).basket = mockBasketStore.basket;
  });

  it('should handle STRIPE_CONFIG discrepancy by returning early', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    const discrepancy: DiscrepancyPayload = {
      type: 'STRIPE_CONFIG',
      message: 'Configuration error'
    };

    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockExecuteValidation).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('STRIPE_CONFIG discrepancy cannot be auto-accepted');
  });

  it('should handle PRICE discrepancy by removing and re-adding items with new price', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    const discrepancy: DiscrepancyPayload = {
      type: 'PRICE',
      items: [
        { id: 'item1', productName: 'Test Item', expected: 50, actual: 60 }
      ]
    };

    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    expect(mockBasketStore.updateItemPrice).toHaveBeenCalledWith('item1', 60);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalledWith(mockBasketPayload, expect.any(String));
  });

  it('should handle INVENTORY discrepancy with zero available by removing item', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    const discrepancy: DiscrepancyPayload = {
      type: 'INVENTORY',
      items: [
        { id: 'item1', productName: 'Test Item', requested: 2, available: 0 }
      ]
    };

    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    expect(mockBasketStore.removeItem).toHaveBeenCalledWith('item1');
    expect(mockBasketStore.updateItemQuantity).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalledWith(mockBasketPayload, expect.any(String));
  });

  it('should handle INVENTORY discrepancy with available stock by updating quantity', async () => {
    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    const discrepancy: DiscrepancyPayload = {
      type: 'INVENTORY',
      items: [
        { id: 'item1', productName: 'Test Item', requested: 2, available: 1 }
      ]
    };

    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    expect(mockBasketStore.removeItem).not.toHaveBeenCalled();
    expect(mockBasketStore.updateItemQuantity).toHaveBeenCalledWith('item1', 1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'START_VALIDATION' });
    expect(mockExecuteValidation).toHaveBeenCalledWith(mockBasketPayload, expect.any(String));
  });

  it('should handle mutation errors by not dispatching', async () => {
    // Mock basket store to throw an error
    (useBasketStore as any).getState = vi.fn(() => ({
      ...mockBasketStore,
      removeItem: vi.fn(() => {
        throw new Error('Mutation failed');
      })
    }));

    const { result } = renderHook(() =>
      useAcceptDiscrepancies(mockDispatch, mockExecuteValidation, mockBasketPayload)
    );

    const discrepancy: DiscrepancyPayload = {
      type: 'INVENTORY',
      items: [
        { id: 'item1', productName: 'Test Item', requested: 2, available: 0 }
      ]
    };

    await act(async () => {
      await result.current.acceptAndContinue(discrepancy, 'test-key');
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockExecuteValidation).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Basket mutations failed:', expect.any(Error));
  });
});
