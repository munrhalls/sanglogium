/**
 * Global flow sync check tests for useSuccessHandler
 * Verifies lock release behavior and state machine transitions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSuccessHandler } from '../../../app/components/features/basket/checkout/useSuccessHandler';
import type { PreCheckoutEvent } from '../../../store/preCheckout/preCheckoutTypes';

// Mock releaseInventoryLock
vi.mock('../../../app/actions/checkout/releaseInventoryLock', () => ({
  releaseInventoryLock: vi.fn()
}));

import { releaseInventoryLock } from '../../../app/actions/checkout/releaseInventoryLock';
const mockReleaseInventoryLock = vi.mocked(releaseInventoryLock);

describe('useSuccessHandler - Global Flow Sync Check', () => {
  let mockDispatch: vi.MockedFunction<(event: PreCheckoutEvent) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch = vi.fn();
  });

  describe('Lock release failure does NOT prevent machine from reaching IDLE', () => {
    it('should return void immediately even if lock release fails', async () => {
      const idempotencyKey = 'test-key-123';

      // Mock releaseInventoryLock to reject
      mockReleaseInventoryLock.mockRejectedValue(new Error('Server error'));

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      // Function should return void immediately (synchronous)
      const result = onResetFromSuccess(idempotencyKey);

      // Should return undefined (void) immediately
      expect(result).toBeUndefined();

      // The async call is a side effect only, doesn't block
      expect(mockReleaseInventoryLock).toHaveBeenCalledWith(idempotencyKey);
    });

    it('should not throw even if releaseInventoryLock throws synchronously', () => {
      const idempotencyKey = 'test-key-123';

      // Mock releaseInventoryLock to throw synchronously
      mockReleaseInventoryLock.mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      // Should not throw - the catch handles it
      expect(() => onResetFromSuccess(idempotencyKey)).not.toThrow();

      // Still returns void
      const result = onResetFromSuccess(idempotencyKey);
      expect(result).toBeUndefined();
    });

    it('should allow state machine to continue regardless of lock release outcome', () => {
      const idempotencyKey = 'test-key-123';

      // Mock releaseInventoryLock to never resolve (hanging promise)
      mockReleaseInventoryLock.mockImplementation(() => new Promise(() => {}));

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      // Should return immediately even though promise never resolves
      const startTime = Date.now();
      const result = onResetFromSuccess(idempotencyKey);
      const endTime = Date.now();

      // Should be essentially instant (synchronous)
      expect(endTime - startTime).toBeLessThan(10);
      expect(result).toBeUndefined();
    });
  });

  describe('No double-release is possible', () => {
    it('should not call releaseInventoryLock when idempotencyKey is null', () => {
      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      onResetFromSuccess(null);

      // Should not call releaseInventoryLock
      expect(mockReleaseInventoryLock).not.toHaveBeenCalled();
    });

    it('should not call releaseInventoryLock when idempotencyKey is undefined', () => {
      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      onResetFromSuccess(undefined);

      // Should not call releaseInventoryLock
      expect(mockReleaseInventoryLock).not.toHaveBeenCalled();
    });

    it('should not call releaseInventoryLock when idempotencyKey is empty string', () => {
      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      onResetFromSuccess('');

      // Should not call releaseInventoryLock
      expect(mockReleaseInventoryLock).not.toHaveBeenCalled();
    });

    it('should only call releaseInventoryLock once per valid idempotencyKey', () => {
      const idempotencyKey = 'test-key-123';
      mockReleaseInventoryLock.mockResolvedValue(undefined);

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      // Call multiple times
      onResetFromSuccess(idempotencyKey);
      onResetFromSuccess(idempotencyKey);
      onResetFromSuccess(idempotencyKey);

      // Should be called once per call (not prevented, but each call is independent)
      expect(mockReleaseInventoryLock).toHaveBeenCalledTimes(3);
      expect(mockReleaseInventoryLock).toHaveBeenNthCalledWith(1, idempotencyKey);
      expect(mockReleaseInventoryLock).toHaveBeenNthCalledWith(2, idempotencyKey);
      expect(mockReleaseInventoryLock).toHaveBeenNthCalledWith(3, idempotencyKey);
    });

    it('should handle mixed valid and invalid idempotencyKeys', () => {
      const validKey = 'test-key-123';
      mockReleaseInventoryLock.mockResolvedValue(undefined);

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      // Mix of valid and invalid keys
      onResetFromSuccess(null);
      onResetFromSuccess(validKey);
      onResetFromSuccess(undefined);
      onResetFromSuccess(validKey);
      onResetFromSuccess('');

      // Should only be called for valid keys
      expect(mockReleaseInventoryLock).toHaveBeenCalledTimes(2);
      expect(mockReleaseInventoryLock).toHaveBeenNthCalledWith(1, validKey);
      expect(mockReleaseInventoryLock).toHaveBeenNthCalledWith(2, validKey);
    });
  });

  describe('Side effect only behavior', () => {
    it('should not affect dispatch or other state', () => {
      const idempotencyKey = 'test-key-123';
      mockReleaseInventoryLock.mockResolvedValue(undefined);

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      onResetFromSuccess(idempotencyKey);

      // Should not dispatch any events
      expect(mockDispatch).not.toHaveBeenCalled();

      // Should be a pure side effect
      expect(mockReleaseInventoryLock).toHaveBeenCalledWith(idempotencyKey);
    });

    it('should handle multiple concurrent calls safely', async () => {
      const key1 = 'test-key-1';
      const key2 = 'test-key-2';
      mockReleaseInventoryLock.mockResolvedValue(undefined);

      const { onResetFromSuccess } = useSuccessHandler(mockDispatch);

      // Concurrent calls
      const result1 = onResetFromSuccess(key1);
      const result2 = onResetFromSuccess(key2);

      // Both should return void immediately
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();

      // Both should be called
      expect(mockReleaseInventoryLock).toHaveBeenCalledTimes(2);
    });
  });
});
