/**
 * Integration tests for validateBasket server action - Inventory reservation step
 * Tests reservation 400 and 200 paths
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateBasket } from '../../../app/actions/checkout';
import type { ValidateBasketResult } from '../../../app/actions/checkout/validateBasket.types';
import { sanityFetch } from '../../../sanity/lib/client';
import { checkoutClient } from '../../../sanity/lib/checkoutClient';

// Mock the sanity clients
vi.mock('../../../sanity/lib/client', () => ({
  sanityFetch: vi.fn()
}));

vi.mock('../../../sanity/lib/checkoutClient', () => ({
  checkoutClient: {
    fetch: vi.fn(),
    transaction: vi.fn(),
    patch: vi.fn()
  }
}));

// Mock Stripe to avoid server-only import issues
vi.mock('../../../lib/stripe/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/pay/session_123' })
      }
    }
  }
}));

const mockSanityFetch = vi.mocked(sanityFetch);
const mockCheckoutFetch = vi.mocked(checkoutClient.fetch);
const mockTransaction = vi.mocked(checkoutClient.transaction);

describe('validateBasket - Inventory reservation', () => {
  const mockBasketPayload = {
    items: [
      { _id: 'item-1', quantity: 2 },
      { _id: 'item-2', quantity: 1 }
    ],
    total: 300 // 2 items at 100 + 1 item at 100 = 300
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock transaction methods
    const mockPatch = vi.fn().mockReturnThis();
    const mockIfRevisionId = vi.fn().mockReturnThis();
    const mockCommit = vi.fn().mockResolvedValue({});

    mockCheckoutFetch.mockImplementation((query: any, params?: any) => {
      if (typeof query === 'string' && query.includes('_rev')) {
        return Promise.resolve({ _rev: 'rev-123' });
      }
      return Promise.resolve([
        { _id: 'item-1', stock: 10, reservedStock: 0, stripePriceId: 'price_1' },
        { _id: 'item-2', stock: 5, reservedStock: 0, stripePriceId: 'price_2' }
      ]);
    });

    mockTransaction.mockReturnValue({
      patch: mockPatch,
      commit: mockCommit
    } as any);

    mockPatch.mockReturnValue({
      ifRevisionId: mockIfRevisionId
    } as any);
  });

  it('should succeed reservation (200 OK) and proceed to Stripe', async () => {
    // Mock Sanity response with matching prices and sufficient stock
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    const result = await validateBasket(mockBasketPayload, 'test-key');

    // Should succeed reservation and proceed to Stripe (will fail at Stripe step)
    expect(result.outcome).not.toBe("FAIL_VALIDATION");
    expect(mockSanityFetch).toHaveBeenCalledTimes(1);
    expect(mockCheckoutFetch).toHaveBeenCalledTimes(3); // 2 for stock check + 1 for revision IDs
    expect(mockTransaction).toHaveBeenCalledTimes(1); // Reservation transaction
  });

  it('should return FAIL_VALIDATION with INVENTORY payload when reservation fails (400)', async () => {
    // Mock Sanity response with matching prices and stock
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    // Mock checkout client to show insufficient available stock
    mockCheckoutFetch.mockImplementation((query: any, params?: any) => {
      if (typeof query === 'string' && query.includes('_rev')) {
        return Promise.resolve({ _rev: 'rev-123' });
      }
      // Return insufficient available stock for item-1
      return Promise.resolve([
        { _id: 'item-1', stock: 1, reservedStock: 0, stripePriceId: 'price_1' }, // Only 1 available
        { _id: 'item-2', stock: 5, reservedStock: 0, stripePriceId: 'price_2' }
      ]);
    });

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({
      outcome: "FAIL_VALIDATION",
      discrepancy: {
        type: "INVENTORY",
        items: [{
          productId: 'item-1',
          productName: 'Product item-1',
          available: 0,
          requested: 2
        }]
      }
    });
    expect(mockTransaction).toHaveBeenCalledTimes(0); // No reservation transaction attempted
  });

  it('should return FAIL_NETWORK when reservation throws error', async () => {
    // Mock Sanity response with matching prices and stock
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    // Mock checkout client to throw error during reservation
    mockCheckoutFetch.mockRejectedValue(new Error('Database error'));

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({ outcome: "FAIL_NETWORK" });
  });
});
