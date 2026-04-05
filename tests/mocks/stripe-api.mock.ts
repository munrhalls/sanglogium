import { jest } from '@jest/globals';

// Mock Stripe API responses
const mockStripeSession = {
  id: 'cs_test_123',
  object: 'checkout.session',
  amount_total: 1999,
  amount_subtotal: 1999,
  total_details: {
    amount_shipping: 0,
    amount_tax: 0,
  },
  currency: 'usd',
  payment_intent: 'pi_test_123',
  customer: 'cus_test_123',
  metadata: {
    productsIntent: '3O1ZNp54LWQGln4uEAU7Vs:1',
    clerkUserId: 'guest',
  },
  line_items: {
    data: [
      {
        id: 'li_test_123',
        object: 'line_item',
        amount_total: 1999,
        quantity: 1,
        price: {
          id: 'price_test_123',
          object: 'price',
          unit_amount: 1999,
          currency: 'usd',
          product: {
            id: '3O1ZNp54LWQGln4uEAU7Vs',
            object: 'product',
            name: 'Meze Audio 99 Series 2.5mm or 4.4mm Replacement Cable',
          },
        },
      },
    ],
  },
  shipping_details: {
    name: 'Test User',
    address: {
      line1: 'Test Street 123',
      city: 'Test City',
      state: 'Test State',
      postal_code: '12345',
      country: 'US',
    },
  },
  customer_details: {
    email: 'test@example.com',
    name: 'Test User',
  },
};

// Mock Stripe client
export const mockStripeClient = {
  checkout: {
    sessions: {
      retrieve: jest.fn().mockImplementation((sessionId: string) => {
        // Return mock session for any cs_test_* session
        if (sessionId.startsWith('cs_test_')) {
          return Promise.resolve({
            ...mockStripeSession,
            id: sessionId,
            // Update metadata based on session ID pattern
            metadata: {
              ...mockStripeSession.metadata,
              productsIntent: sessionId.includes('_expired') ? '3O1ZNp54LWQGln4uEAU7Vs:2' : '3O1ZNp54LWQGln4uEAU7Vs:1',
            },
          });
        }
        // For real sessions, call the actual API
        return require('stripe')(process.env.STRIPE_SECRET_KEY).checkout.sessions.retrieve(sessionId);
      }),
    },
  },
  webhooks: {
    constructEvent: jest.fn().mockImplementation((payload: string, signature: string, secret: string) => {
      // Use actual Stripe webhook construction for real testing
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      return stripe.webhooks.constructEvent(payload, signature, secret);
    }),
  },
};

// Helper to create a mock session with custom data
export function createMockSession(overrides: Partial<typeof mockStripeSession> = {}) {
  return {
    ...mockStripeSession,
    ...overrides,
  };
}
