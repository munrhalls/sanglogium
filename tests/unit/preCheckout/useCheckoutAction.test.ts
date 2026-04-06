/**
 * Unit tests for useCheckoutAction hook
 * Tests AbortController, timeout, and result dispatching
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

describe('useCheckoutAction', () => {
  let mockDispatch: vi.MockedFunction<(event: PreCheckoutEvent) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should dispatch PASS_VALIDATION when validateBasket returns PASS', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    mockValidateBasket.mockResolvedValue({
      outcome: 'PASS',
      stripeUrl: 'https://checkout.stripe.com/pay/session_123'
    });

    const { executeValidation } = useCheckoutAction(mockDispatch);

    await executeValidation(mockPayload, idempotencyKey);

    expect(mockValidateBasket).toHaveBeenCalledWith(
      mockPayload,
      idempotencyKey,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'PASS_VALIDATION',
      stripeUrl: 'https://checkout.stripe.com/pay/session_123'
    });
  });

  it('should dispatch FAIL_VALIDATION when validateBasket returns FAIL_VALIDATION', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    mockValidateBasket.mockResolvedValue({
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

    const { executeValidation } = useCheckoutAction(mockDispatch);

    await executeValidation(mockPayload, idempotencyKey);

    expect(mockDispatch).toHaveBeenCalledWith({
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

  it('should dispatch FAIL_NETWORK when validateBasket returns FAIL_NETWORK', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    mockValidateBasket.mockResolvedValue({
      outcome: 'FAIL_NETWORK'
    });

    const { executeValidation } = useCheckoutAction(mockDispatch);

    await executeValidation(mockPayload, idempotencyKey);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FAIL_NETWORK'
    });
  });

  it('should dispatch FAIL_NETWORK when validateBasket throws AbortError', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    const abortError = new DOMException('Aborted', 'AbortError');
    mockValidateBasket.mockRejectedValue(abortError);

    const { executeValidation } = useCheckoutAction(mockDispatch);

    await executeValidation(mockPayload, idempotencyKey);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FAIL_NETWORK'
    });
  });

  it('should dispatch FAIL_NETWORK when validateBasket throws generic Error', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    mockValidateBasket.mockRejectedValue(new Error('Network error'));

    const { executeValidation } = useCheckoutAction(mockDispatch);

    await executeValidation(mockPayload, idempotencyKey);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FAIL_NETWORK'
    });
  });

  it('should abort controller after 10 seconds and dispatch FAIL_NETWORK', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    // Mock validateBasket to reject when aborted
    const abortError = new DOMException('Aborted', 'AbortError');
    mockValidateBasket.mockImplementation(async (_, __, options) => {
      return new Promise((_, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject(abortError);
        });
      });
    });

    const { executeValidation } = useCheckoutAction(mockDispatch);

    // Start the validation
    executeValidation(mockPayload, idempotencyKey);

    // Fast-forward 10 seconds
    vi.advanceTimersByTime(10_000);

    // Wait for the timeout to trigger
    await vi.runAllTimersAsync();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'FAIL_NETWORK'
    });
  });

  it('should clear timeout when validateBasket succeeds quickly', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    mockValidateBasket.mockResolvedValue({
      outcome: 'PASS',
      stripeUrl: 'https://checkout.stripe.com/pay/session_123'
    });

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { executeValidation } = useCheckoutAction(mockDispatch);

    await executeValidation(mockPayload, idempotencyKey);

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('should clear timeout when validateBasket fails', async () => {
    const mockPayload: BasketPayload = {
      items: [{ _id: 'item-1', quantity: 2 }],
      total: 200
    };
    const idempotencyKey = 'test-key-123';

    mockValidateBasket.mockRejectedValue(new Error('Network error'));

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { executeValidation } = useCheckoutAction(mockDispatch);

    await executeValidation(mockPayload, idempotencyKey);

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});
