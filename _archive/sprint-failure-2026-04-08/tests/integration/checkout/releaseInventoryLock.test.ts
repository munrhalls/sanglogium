/**
 * Integration tests for releaseInventoryLock server action
 * Tests fire-and-forget contract with various response scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { releaseInventoryLock } from '../../../app/actions/checkout/releaseInventoryLock';

// Mock checkoutClient
vi.mock('../../../sanity/lib/checkoutClient', () => ({
  checkoutClient: {
    transaction: vi.fn(),
  },
}));

import { checkoutClient } from '../../../sanity/lib/checkoutClient';
const mockCheckoutClient = vi.mocked(checkoutClient);

// Mock console.error to avoid test output noise
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('releaseInventoryLock - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve void on successful release (200 response equivalent)', async () => {
    const idempotencyKey = 'test-key-123';
    
    // Mock successful transaction
    const mockTransaction = {
      patch: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    };
    mockCheckoutClient.transaction.mockReturnValue(mockTransaction);

    const result = await releaseInventoryLock(idempotencyKey);

    // Should resolve void (undefined)
    expect(result).toBeUndefined();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should resolve void on server error (5xx response equivalent)', async () => {
    const idempotencyKey = 'test-key-123';
    
    // Mock transaction that throws
    const mockTransaction = {
      patch: vi.fn(),
      commit: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    };
    mockCheckoutClient.transaction.mockReturnValue(mockTransaction);

    const result = await releaseInventoryLock(idempotencyKey);

    // Should still resolve void (fire-and-forget)
    expect(result).toBeUndefined();
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to release inventory lock:',
      expect.any(Error)
    );
  });

  it('should resolve void on network timeout', async () => {
    const idempotencyKey = 'test-key-123';
    
    // Mock transaction that times out
    const mockTransaction = {
      patch: vi.fn(),
      commit: vi.fn().mockRejectedValue(new Error('Network timeout')),
    };
    mockCheckoutClient.transaction.mockReturnValue(mockTransaction);

    const result = await releaseInventoryLock(idempotencyKey);

    // Should still resolve void (fire-and-forget)
    expect(result).toBeUndefined();
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to release inventory lock:',
      expect.any(Error)
    );
  });

  it('should never throw to client - fire-and-forget contract', async () => {
    const idempotencyKey = 'test-key-123';
    
    // Mock catastrophic error
    mockCheckoutClient.transaction.mockImplementation(() => {
      throw new Error('Client not initialized');
    });

    // Should not throw
    await expect(releaseInventoryLock(idempotencyKey)).resolves.toBeUndefined();
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to release inventory lock:',
      expect.any(Error)
    );
  });

  it('should handle empty idempotencyKey gracefully', async () => {
    const idempotencyKey = '';
    
    // Mock successful transaction
    const mockTransaction = {
      patch: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    };
    mockCheckoutClient.transaction.mockReturnValue(mockTransaction);

    const result = await releaseInventoryLock(idempotencyKey);

    expect(result).toBeUndefined();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });
});
