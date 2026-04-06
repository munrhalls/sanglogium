/**
 * Integration tests for validateBasket server action - Price validation step
 * Tests price matching and mismatch scenarios
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

describe('validateBasket - Price validation', () => {
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

  it('should return FAIL_VALIDATION with PRICE payload on price mismatch', async () => {
    // Mock Sanity response with price mismatch on item-2
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 120, stock: 5, stripePriceId: 'price_2' } // Price is 120, basket expects 100
    ]);

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({
      outcome: "FAIL_VALIDATION",
      discrepancy: {
        type: "PRICE",
        items: [{
          id: 'item-2',
          productName: 'Product 2',
          expected: 100, // Basket price per item (300 / 3 items)
          actual: 120   // Sanity price
        }]
      }
    });
  });

  it('should proceed when prices match', async () => {
    // Mock Sanity response with matching prices
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    const result = await validateBasket(mockBasketPayload, 'test-key');

    // Should pass price validation and proceed to next steps
    expect(result.outcome).not.toBe("FAIL_VALIDATION");
    expect(mockSanityFetch).toHaveBeenCalledTimes(1);
    expect(mockCheckoutFetch).toHaveBeenCalledTimes(3); // Stock check + revision IDs
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it('should return FAIL_VALIDATION when product not found', async () => {
    // Mock Sanity response with missing product
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' }
      // item-2 is missing
    ]);

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({
      outcome: "FAIL_VALIDATION",
      discrepancy: {
        type: "INVENTORY",
        items: [{
          id: 'item-2',
          productName: 'Product item-2',
          available: 0,
          requested: 1
        }]
      }
    });
  });

  it('should return FAIL_NETWORK on Sanity fetch error', async () => {
    // Mock Sanity client to throw an error (simulating 5xx)
    mockSanityFetch.mockRejectedValue(new Error('Network error'));

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({ outcome: "FAIL_NETWORK" });
  });
});
