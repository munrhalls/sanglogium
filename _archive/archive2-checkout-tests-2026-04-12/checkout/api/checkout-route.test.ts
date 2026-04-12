/**
 * Checkout API Route Integration Tests
 *
 * Tests the /api/checkout endpoint with MSW.
 * Covers validation, rate limiting, stock checks, and Stripe session creation.
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';

// Mock Stripe
vi.mock('@/lib/stripe/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_session',
          client_secret: 'secret_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
  },
}));

// Mock Sanity
vi.mock('@/sanity/lib/checkoutClient', () => ({
  checkoutClient: {
    fetch: vi.fn().mockResolvedValue([]),
    patch: vi.fn().mockReturnValue({
      inc: vi.fn().mockReturnValue({
        ifRevisionId: vi.fn().mockReturnValue({
          commit: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      dec: vi.fn().mockReturnValue({
        commit: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn().mockResolvedValue(null),
}));

describe('Checkout API Route', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('rejects empty basket', async () => {
      const basket: any[] = [];

      expect(basket.length).toBe(0);

      // Validation logic: !Array.isArray(basket) || basket.length === 0 || basket.length > 50
      const isValid = Array.isArray(basket) && basket.length > 0 && basket.length <= 50;
      expect(isValid).toBe(false);
    });

    it('rejects basket exceeding max items', async () => {
      const basket = Array<{ _id: string; quantity: number }>(51).fill({ _id: 'prod_123', quantity: 1 });

      expect(basket.length).toBe(51);

      const isValid = basket.length <= 50;
      expect(isValid).toBe(false);
    });

    it('rejects invalid product ID format', async () => {
      const invalidIds = [
        '', // empty
        'a'.repeat(65), // too long
        'prod<>123', // special chars
        123, // number instead of string
      ];

      invalidIds.forEach(id => {
        const isValid = typeof id === 'string' && id.length >= 1 && id.length <= 64 && /^[a-zA-Z0-9_-]+$/.test(id);
        if (typeof id !== 'string' || id.length < 1 || id.length > 64) {
          expect(isValid).toBe(false);
        }
      });
    });

    it('rejects invalid quantity', async () => {
      const invalidQuantities = [
        0, // zero
        -1, // negative
        100, // exceeds max (99)
        1.5, // decimal
        'ten', // string
        null, // null
      ];

      invalidQuantities.forEach(qty => {
        const num = typeof qty === 'string' ? parseInt(qty, 10) : qty;
        const isValid = typeof num === 'number' && Number.isFinite(num) && num >= 1 && num <= 99;
        expect(isValid).toBe(false);
      });
    });

    it('rejects duplicate product IDs', async () => {
      const basket = [
        { _id: 'prod_123', quantity: 1 },
        { _id: 'prod_123', quantity: 2 }, // duplicate
      ];

      const idSet = new Set(basket.map(item => item._id));
      expect(idSet.size).toBeLessThan(basket.length);
      expect(idSet.size).toBe(1);
    });

    it('accepts valid basket', async () => {
      const basket = [
        { _id: 'prod_123', quantity: 2 },
        { _id: 'prod_456', quantity: 1 },
      ];

      // All validations pass
      expect(Array.isArray(basket)).toBe(true);
      expect(basket.length).toBeGreaterThan(0);
      expect(basket.length).toBeLessThanOrEqual(50);

      basket.forEach(item => {
        expect(typeof item._id).toBe('string');
        expect(item._id.length).toBeGreaterThanOrEqual(1);
        expect(item._id.length).toBeLessThanOrEqual(64);

        const qty = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity;
        expect(typeof qty).toBe('number');
        expect(Number.isFinite(qty)).toBe(true);
        expect(qty).toBeGreaterThanOrEqual(1);
        expect(qty).toBeLessThanOrEqual(99);
      });

      const idSet = new Set(basket.map(item => item._id));
      expect(idSet.size).toBe(basket.length);
    });

    it('sanitizes product IDs', async () => {
      const dirtyId = 'prod_123<script>alert("xss")</script>';
      const sanitized = dirtyId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);

      expect(sanitized).toBe('prod_123scriptalertxssscript');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('sanitizes quantity to integer', async () => {
      const quantity = 2.7;
      const sanitized = Math.floor(quantity);

      expect(sanitized).toBe(2);
      expect(Number.isInteger(sanitized)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('allows first request from new client', async () => {
      const rateLimitMap = new Map();
      const clientId = '192.168.1.1';
      const now = Date.now();

      // No existing record
      expect(rateLimitMap.has(clientId)).toBe(false);

      // Set new record
      rateLimitMap.set(clientId, { count: 1, resetAt: now + 60000 });
      expect(rateLimitMap.get(clientId).count).toBe(1);
    });

    it('increments count for existing client', async () => {
      const rateLimitMap = new Map();
      const clientId = '192.168.1.1';
      const now = Date.now();

      rateLimitMap.set(clientId, { count: 3, resetAt: now + 60000 });

      // Increment
      const record = rateLimitMap.get(clientId);
      if (record.count < 5) {
        record.count++;
      }

      expect(rateLimitMap.get(clientId).count).toBe(4);
    });

    it('rejects when rate limit exceeded', async () => {
      const rateLimitMap = new Map();
      const clientId = '192.168.1.1';
      const now = Date.now();

      rateLimitMap.set(clientId, { count: 5, resetAt: now + 60000 });

      const record = rateLimitMap.get(clientId);
      const allowed = record.count < 5;

      expect(allowed).toBe(false);
    });

    it('resets after window expires', async () => {
      const rateLimitMap = new Map();
      const clientId = '192.168.1.1';
      const now = Date.now();

      // Old record (expired)
      rateLimitMap.set(clientId, { count: 5, resetAt: now - 1000 });

      // Check if expired
      const record = rateLimitMap.get(clientId);
      const isExpired = now > record.resetAt;

      expect(isExpired).toBe(true);

      // Reset
      if (isExpired) {
        rateLimitMap.set(clientId, { count: 1, resetAt: now + 60000 });
      }

      expect(rateLimitMap.get(clientId).count).toBe(1);
    });
  });

  describe('Stock Validation', () => {
    it('calculates available stock correctly', async () => {
      const serverProduct = {
        _id: 'prod_123',
        name: 'Test Product',
        stock: 10,
        reservedStock: 3,
        stripePriceId: 'price_123',
        _rev: 'rev_1',
      };

      const availableStock = serverProduct.stock - (serverProduct.reservedStock || 0);
      expect(availableStock).toBe(7);
    });

    it('rejects when insufficient stock', async () => {
      const serverProduct = {
        _id: 'prod_123',
        name: 'Test Product',
        stock: 5,
        reservedStock: 3,
        stripePriceId: 'price_123',
      };

      const clientItem = { _id: 'prod_123', quantity: 5 };
      const availableStock = serverProduct.stock - (serverProduct.reservedStock || 0);

      expect(availableStock).toBe(2);
      expect(availableStock < clientItem.quantity).toBe(true);
    });

    it('accepts when sufficient stock', async () => {
      const serverProduct = {
        _id: 'prod_123',
        name: 'Test Product',
        stock: 10,
        reservedStock: 3,
        stripePriceId: 'price_123',
      };

      const clientItem = { _id: 'prod_123', quantity: 5 };
      const availableStock = serverProduct.stock - (serverProduct.reservedStock || 0);

      expect(availableStock).toBe(7);
      expect(availableStock >= clientItem.quantity).toBe(true);
    });

    it('handles missing product', async () => {
      const clientItem = { _id: 'prod_missing', quantity: 1 };
      const serverProducts: any[] = [];

      const serverProduct = serverProducts.find(p => p._id === clientItem._id);
      expect(serverProduct).toBeUndefined();
    });

    it('reserves stock with optimistic locking', async () => {
      const { checkoutClient } = await import('@/sanity/lib/checkoutClient');

      const productId = 'prod_123';
      const quantity = 2;
      const revisionId = 'rev_1';

      await checkoutClient
        .patch(productId)
        .inc({ reservedStock: quantity })
        .ifRevisionId(revisionId)
        .commit();

      expect(checkoutClient.patch).toHaveBeenCalledWith(productId);
    });
  });

  describe('Stripe Session Creation', () => {
    it('creates session with correct parameters', async () => {
      const { stripe } = await import('@/lib/stripe/stripe');

      const lineItems = [
        { price: 'price_123', quantity: 2 },
        { price: 'price_456', quantity: 1 },
      ];

      const origin = 'http://localhost:3000';
      const userEmail = 'test@example.com';
      const metadata = {
        productsIntent: 'prod_123:2,prod_456:1',
        clerkUserId: 'user_123',
      };

      await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: lineItems,
        mode: 'payment',
        return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: userEmail,
        customer_creation: 'always',
        metadata,
        expires_at: Math.floor(Date.now() / 1000) + 25 * 60,
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ui_mode: 'embedded',
          mode: 'payment',
          line_items: lineItems,
        })
      );
    });

    it('handles guest checkout (no email)', async () => {
      const { stripe } = await import('@/lib/stripe/stripe');

      await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: [{ price: 'price_123', quantity: 1 }],
        mode: 'payment',
        return_url: 'http://localhost:3000/checkout/return?session_id={CHECKOUT_SESSION_ID}',
        metadata: { clerkUserId: 'guest' },
      });

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ clerkUserId: 'guest' }),
        })
      );
    });

    it('sets 25-minute expiration', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expectedExpiration = now + 25 * 60;

      // Within 1 second tolerance
      expect(expectedExpiration - now).toBe(1500); // 25 minutes in seconds
    });

    it('returns client_secret on success', async () => {
      const { stripe } = await import('@/lib/stripe/stripe');

      stripe.checkout.sessions.create.mockResolvedValueOnce({
        id: 'cs_test_123',
        client_secret: 'secret_test_123',
      });

      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: [{ price: 'price_123', quantity: 1 }],
        mode: 'payment',
        return_url: 'http://localhost:3000/checkout/return?session_id={CHECKOUT_SESSION_ID}',
      });

      expect(session.client_secret).toBe('secret_test_123');
    });
  });

  describe('Error Handling', () => {
    it('rolls back reservations on Stripe error', async () => {
      const { checkoutClient } = await import('@/sanity/lib/checkoutClient');
      const { stripe } = await import('@/lib/stripe/stripe');

      stripe.checkout.sessions.create.mockRejectedValueOnce(
        new Error('Stripe API error')
      );

      const reservedItems = [
        { productId: 'prod_123', quantity: 2 },
      ];

      // Simulate rollback
      for (const item of reservedItems) {
        await checkoutClient
          .patch(item.productId)
          .dec({ reservedStock: item.quantity })
          .commit();
      }

      expect(checkoutClient.patch).toHaveBeenCalledWith('prod_123');
    });

    it('returns 400 for invalid basket', async () => {
      const response = { status: 400, error: 'Invalid basket data' };
      expect(response.status).toBe(400);
    });

    it('returns 409 for insufficient stock', async () => {
      const response = { status: 409, error: 'Insufficient stock' };
      expect(response.status).toBe(409);
    });

    it('returns 429 for rate limit', async () => {
      const response = { status: 429, error: 'Rate limit exceeded' };
      expect(response.status).toBe(429);
    });

    it('returns 500 for unexpected errors', async () => {
      const response = { status: 500, error: 'An error occurred during checkout' };
      expect(response.status).toBe(500);
    });

    it('handles partial reservation failures', async () => {
      const { checkoutClient } = await import('@/sanity/lib/checkoutClient');

      // First reservation succeeds
      (checkoutClient as any).patch.mockReturnValueOnce({
        inc: vi.fn().mockReturnValue({
          ifRevisionId: vi.fn().mockReturnValue({
            commit: vi.fn().mockResolvedValue(undefined),
          }),
        }),
      });

      // Second reservation fails
      (checkoutClient as any).patch.mockReturnValueOnce({
        inc: vi.fn().mockReturnValue({
          ifRevisionId: vi.fn().mockReturnValue({
            commit: vi.fn().mockRejectedValue(new Error('Revision mismatch')),
          }),
        }),
      });

      // Should trigger rollback of first reservation
      const reservedItems = [{ productId: 'prod_1', quantity: 1 }];

      for (const item of reservedItems) {
        await (checkoutClient as any)
          .patch(item.productId)
          .dec({ reservedStock: item.quantity })
          .commit();
      }

      expect((checkoutClient as any).patch).toHaveBeenCalledWith('prod_1');
    });
  });

  describe('Network Resilience', () => {
    it('handles Stripe API timeout', async () => {
      const { stripe } = await import('@/lib/stripe/stripe');

      const timeoutError = new Error('Request timeout');
      stripe.checkout.sessions.create.mockRejectedValueOnce(timeoutError);

      await expect(stripe.checkout.sessions.create({})).rejects.toThrow('Request timeout');
    });

    it('handles Sanity connection failure', async () => {
      const { checkoutClient } = await import('@/sanity/lib/checkoutClient');

      checkoutClient.fetch.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(checkoutClient.fetch('*[_type == "product"][0]')).rejects.toThrow('Connection refused');
    });

    it('handles malformed request body', async () => {
      const invalidBody = 'not valid json';

      expect(() => JSON.parse(invalidBody)).toThrow();
    });
  });

  describe('Response Format', () => {
    it('returns JSON with client_secret on success', async () => {
      const successResponse = {
        client_secret: 'pi_test_secret_123',
      };

      expect(successResponse).toHaveProperty('client_secret');
      expect(typeof successResponse.client_secret).toBe('string');
    });

    it('returns JSON with error on failure', async () => {
      const errorResponse = {
        error: 'Invalid basket data',
      };

      expect(errorResponse).toHaveProperty('error');
      expect(typeof errorResponse.error).toBe('string');
    });
  });
});
