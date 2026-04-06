/**
 * Unit tests for useSuccessHandler hook
 * Tests redirect and watchdog behavior in jsdom environment
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSuccessHandler } from '../../../app/components/features/basket/checkout/useSuccessHandler';
import type { PreCheckoutEvent } from '../../../store/preCheckout/preCheckoutTypes';

// Mock window.location.assign
const mockAssign = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    assign: mockAssign,
  },
  writable: true,
});

// Mock window.setTimeout
const mockSetTimeout = vi.fn();
Object.defineProperty(window, 'setTimeout', {
  value: mockSetTimeout,
  writable: true,
});

// Mock releaseInventoryLock
vi.mock('../../../app/actions/checkout/releaseInventoryLock', () => ({
  releaseInventoryLock: vi.fn()
}));

import { releaseInventoryLock } from '../../../app/actions/checkout/releaseInventoryLock';
const mockReleaseInventoryLock = vi.mocked(releaseInventoryLock);

describe('useSuccessHandler', () => {
  let mockDispatch: vi.MockedFunction<(event: PreCheckoutEvent) => void>;
  let mockWatchdogRef: { current: number | null };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn();
    mockWatchdogRef = { current: null };

    // Mock setTimeout to return a timer ID
    mockSetTimeout.mockReturnValue(12345);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('onSuccessEntry', () => {
    it('should call window.location.assign with correct stripeUrl', () => {
      const stripeUrl = 'https://checkout.stripe.com/pay/session_123';
      const { onSuccessEntry } = useSuccessHandler(mockDispatch);

      onSuccessEntry(stripeUrl, mockWatchdogRef);

      expect(mockAssign).toHaveBeenCalledWith(stripeUrl);
    });

    it('should start 5-second watchdog timer', () => {
      const stripeUrl = 'https://checkout.stripe.com/pay/session_123';
      const { onSuccessEntry } = useSuccessHandler(mockDispatch);

      onSuccessEntry(stripeUrl, mockWatchdogRef);

      expect(mockSetTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        5_000
      );
      expect(mockWatchdogRef.current).toBe(12345);
    });

    it('should dispatch FAIL_NETWORK after 5000ms', () => {
      const stripeUrl = 'https://checkout.stripe.com/pay/session_123';
      const { onSuccessEntry } = useSuccessHandler(mockDispatch);

      onSuccessEntry(stripeUrl, mockWatchdogRef);

      // Get the timeout callback
      const timeoutCallback = mockSetTimeout.mock.calls[0][0];

      // Execute the callback
      timeoutCallback();

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'FAIL_NETWORK'
      });
    });

    it('should not dispatch FAIL_NETWORK if watchdog is cleared before 5000ms', () => {
      const stripeUrl = 'https://checkout.stripe.com/pay/session_123';
      const { onSuccessEntry } = useSuccessHandler(mockDispatch);

      onSuccessEntry(stripeUrl, mockWatchdogRef);

      // Clear the watchdog (simulating component unmount)
      mockWatchdogRef.current = null;

      // Get the timeout callback
      const timeoutCallback = mockSetTimeout.mock.calls[0][0];

      // Execute the callback
      timeoutCallback();

      // Since watchdogRef.current is null, the dispatch should not happen
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('onResetFromSuccess', () => {
    it('should call releaseInventoryLock with the idempotencyKey', () => {
      const idempotencyKey = 'test-key-123';
      mockReleaseInventoryLock.mockResolvedValue(undefined);

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      onResetFromSuccess(idempotencyKey);

      expect(mockReleaseInventoryLock).toHaveBeenCalledTimes(1);
      expect(mockReleaseInventoryLock).toHaveBeenCalledWith(idempotencyKey);
    });

    it('should not throw if releaseInventoryLock throws', () => {
      const idempotencyKey = 'test-key-123';
      mockReleaseInventoryLock.mockRejectedValue(new Error('Server error'));

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      expect(() => onResetFromSuccess(idempotencyKey)).not.toThrow();
    });

    it('should not call releaseInventoryLock if idempotencyKey is null', () => {
      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      onResetFromSuccess(null);

      expect(mockReleaseInventoryLock).not.toHaveBeenCalled();
    });

    it('should return void immediately (no await)', () => {
      const idempotencyKey = 'test-key-123';
      mockReleaseInventoryLock.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      // Should return immediately, not wait for the promise
      const result = onResetFromSuccess(idempotencyKey);

      expect(result).toBeUndefined();
      expect(mockReleaseInventoryLock).toHaveBeenCalledWith(idempotencyKey);
    });
  });
});
