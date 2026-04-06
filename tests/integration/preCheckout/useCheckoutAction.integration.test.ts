/**
 * Integration tests for useCheckoutAction hook
 * Tests the full integration with mocked server action
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCheckoutAction } from '../../../app/components/features/basket/checkout/useCheckoutAction';
import type { PreCheckoutEvent } from '../../../store/preCheckout/preCheckoutTypes';
import type { BasketPayload } from '../../../app/actions/checkout/validateBasket.types';

// Mock validateBasket server action
vi.mock('../../../app/actions/checkout', () => ({
  validateBasket: vi.fn()
}));

import { validateBasket } from '../../../app/actions/checkout';
const mockValidateBasket = vi.mocked(validateBasket);

describe('useCheckoutAction - Integration', () => {
  let mockDispatch: vi.MockedFunction<(event: PreCheckoutEvent) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle complete validation flow from start to PASS', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    // Mock successful validation
    mockValidateBasket.mockResolvedValue({
      outcome: 'PASS',
      stripeUrl: 'https://checkout.stripe.com/pay/session_123'
    });

    // Get the hook function
    const { executeValidation } = useCheckoutAction(mockDispatch);

    // Execute validation
    await executeValidation(mockPayload, idempotencyKey);

    // Verify dispatch was called
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'PASS_VALIDATION',
      stripeUrl: 'https://checkout.stripe.com/pay/session_123'
    });

    // Verify server action was called with correct parameters
    expect(mockValidateBasket).toHaveBeenCalledWith(
      mockPayload,
      idempotencyKey,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('should handle validation failure flow', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    // Mock validation failure
    mockValidateBasket.mockResolvedValue({
      outcome: 'FAIL_VALIDATION',
      discrepancy: {
        type: 'INVENTORY',
        items: [{
          productId: 'item-1',
          productName: 'Product 1',
          requested: 2,
          available: 1
        }]
      }
    });

    // Get the hook function
    const { executeValidation } = useCheckoutAction(mockDispatch);

    // Execute validation
    await executeValidation(mockPayload, idempotencyKey);

    // Verify dispatch was called
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FAIL_VALIDATION',
      payload: {
        type: 'INVENTORY',
        items: [{
          productId: 'item-1',
          productName: 'Product 1',
          requested: 2,
          available: 1
        }]
      }
    });
  });

  it('should handle network error flow', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    // Mock network error
    mockValidateBasket.mockRejectedValue(new Error('Network timeout'));

    // Get the hook function
    const { executeValidation } = useCheckoutAction(mockDispatch);

    // Execute validation
    await executeValidation(mockPayload, idempotencyKey);

    // Verify dispatch was called
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FAIL_NETWORK'
    });
  });

  it('should handle timeout scenario', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    // Mock slow validation that rejects when aborted
    const abortError = new DOMException('Aborted', 'AbortError');
    mockValidateBasket.mockImplementation(async (_, __, options) => {
      return new Promise((_, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject(abortError);
        });
      });
    });

    // Get the hook function
    const { executeValidation } = useCheckoutAction(mockDispatch);

    // Execute validation (don't await - it will timeout)
    const promise = executeValidation(mockPayload, idempotencyKey);

    // Fast-forward 10 seconds to trigger timeout
    vi.advanceTimersByTime(10_000);

    // Wait for the timeout to trigger
    await promise;

    // Verify dispatch was called
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FAIL_NETWORK'
    });
  });

  it('should handle multiple concurrent validations', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };

    // Mock different outcomes for different calls
    mockValidateBasket
      .mockResolvedValueOnce({
        outcome: 'PASS',
        stripeUrl: 'https://checkout.stripe.com/pay/session_1'
      })
      .mockResolvedValueOnce({
        outcome: 'FAIL_VALIDATION',
        discrepancy: {
          type: 'PRICE',
          items: [{
            productId: 'item-1',
            productName: 'Product 1',
            expected: 100,
            actual: 120
          }]
        }
      });

    // Get the hook function
    const { executeValidation } = useCheckoutAction(mockDispatch);

    // Execute two concurrent validations
    await Promise.all([
      executeValidation(mockPayload, 'key-1'),
      executeValidation(mockPayload, 'key-2')
    ]);

    // Verify both dispatches were called
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: 'PASS_VALIDATION',
      stripeUrl: 'https://checkout.stripe.com/pay/session_1'
    });
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: 'FAIL_VALIDATION',
      payload: {
        type: 'PRICE',
        items: [{
          productId: 'item-1',
          productName: 'Product 1',
          expected: 100,
          actual: 120
        }]
      }
    });
  });
});
