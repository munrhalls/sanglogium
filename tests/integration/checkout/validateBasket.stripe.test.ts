/**
 * Integration tests for validateBasket server action - Stripe session creation step
 * Tests all 3 Stripe result paths (200, 400, 5xx)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateBasket } from '../../../app/actions/checkout';
import type { ValidateBasketResult } from '../../../app/actions/checkout/validateBasket.types';
import { sanityFetch } from '../../../sanity/lib/client';
import { checkoutClient } from '../../../sanity/lib/checkoutClient';
import { stripe } from '../../../lib/stripe/stripe';

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

// Mock Stripe
vi.mock('../../../lib/stripe/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn()
      }
    }
  }
}));

const mockSanityFetch = vi.mocked(sanityFetch);
const mockCheckoutFetch = vi.mocked(checkoutClient.fetch);
const mockTransaction = vi.mocked(checkoutClient.transaction);
const mockStripeCreate = vi.mocked(stripe.checkout.sessions.create);

describe('validateBasket - Stripe session creation', () => {
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

  it('should create Stripe session successfully (200)', async () => {
    // Mock Sanity response with matching prices and sufficient stock
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    // Mock successful Stripe session creation
    mockStripeCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/session_123'
    });

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({
      outcome: "PASS",
      stripeUrl: 'https://checkout.stripe.com/pay/session_123'
    });
    expect(mockSanityFetch).toHaveBeenCalledTimes(1);
    expect(mockCheckoutFetch).toHaveBeenCalledTimes(3);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockStripeCreate).toHaveBeenCalledWith({
      payment_method_types: ['card'],
      line_items: [
        { price: 'price_1', quantity: 2 },
        { price: 'price_2', quantity: 1 }
      ],
      mode: 'payment',
      success_url: expect.stringMatching(/\/checkout\/return$/),
      cancel_url: expect.stringMatching(/\/basket\?checkout=cancelled$/),
      customer_email: undefined,
      metadata: {
        idempotencyKey: 'test-key',
        items: 'item-1:2,item-2:1'
      },
      expires_at: expect.any(Number)
    }, {
      idempotencyKey: 'test-key'
    });
  });

  it('should return FAIL_VALIDATION with STRIPE_CONFIG on Stripe 400 error', async () => {
    // Mock Sanity response with matching prices and stock
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    // Mock Stripe 400 error
    mockStripeCreate.mockRejectedValue(new Error('400 Bad Request: invalid_price_id'));

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({
      outcome: "FAIL_VALIDATION",
      discrepancy: {
        type: "STRIPE_CONFIG",
        items: [{
          id: "stripe",
          issue: "Order configuration error"
        }]
      }
    });
    expect(mockTransaction).toHaveBeenCalledTimes(2); // Reserve + rollback
  });

  it('should return FAIL_VALIDATION with STRIPE_CONFIG when missing Stripe price IDs', async () => {
    // Mock Sanity response with missing stripePriceId
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: null } // Missing price ID
    ]);

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({
      outcome: "FAIL_VALIDATION",
      discrepancy: {
        type: "STRIPE_CONFIG",
        items: [{
          id: "stripe",
          issue: "Order configuration error"
        }]
      }
    });
    expect(mockTransaction).toHaveBeenCalledTimes(2); // Reserve + rollback
  });

  it('should return FAIL_NETWORK on Stripe 5xx error', async () => {
    // Mock Sanity response with matching prices and stock
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    // Mock Stripe 5xx error
    mockStripeCreate.mockRejectedValue(new Error('500 Internal Server Error'));

    const result = await validateBasket(mockBasketPayload, 'test-key');

    expect(result).toEqual({ outcome: "FAIL_NETWORK" });
    expect(mockTransaction).toHaveBeenCalledTimes(3); // Reserve + rollback (Stripe) + rollback (outer)
  });

  it('should pass idempotencyKey to Stripe session creation', async () => {
    // Mock Sanity response with matching prices and stock
    mockSanityFetch.mockResolvedValue([
      { _id: 'item-1', name: 'Product 1', displayPrice: 100, stock: 10, stripePriceId: 'price_1' },
      { _id: 'item-2', name: 'Product 2', displayPrice: 100, stock: 5, stripePriceId: 'price_2' }
    ]);

    // Mock successful Stripe session creation
    mockStripeCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/session_123'
    });

    await validateBasket(mockBasketPayload, 'unique-idempotency-key-123');

    // Verify idempotencyKey is passed to Stripe
    expect(mockStripeCreate).toHaveBeenCalledWith(
      expect.any(Object),
      { idempotencyKey: 'unique-idempotency-key-123' }
    );
  });
});
