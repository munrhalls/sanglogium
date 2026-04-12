/**
 * FSM (Finite State Machine) Tests
 *
 * Covers all state transitions for the checkout flow.
 * Each test verifies: given state + event -> expected state + context
 *
 * This maps the "infinite" user interaction stream to finite, enumerable states.
 */

import { describe, it, expect } from 'vitest';
import {
  checkoutTransition,
  CheckoutState,
  CheckoutEvent,
  CheckoutContext
} from '@/store/checkout/checkoutMachine';
import { FSM_SCENARIOS } from '../fixtures/stripe';

describe('Checkout FSM', () => {
  const baseContext: CheckoutContext = {
    status: 'idle',
    errorMessage: null,
    idempotencyKey: null,
    clientSecret: null,
    reservationId: null,
    expiresAt: null,
  };

  describe('State: idle', () => {
    it('CHECKOUT_CLICK -> processing', () => {
      const result = checkoutTransition('idle', 'CHECKOUT_CLICK', baseContext);
      expect(result.state).toBe('processing');
      expect(result.context.status).toBe('processing');
      expect(result.context.errorMessage).toBeNull();
    });

    it('ADDRESS_SUBMIT -> processing', () => {
      const result = checkoutTransition('idle', 'ADDRESS_SUBMIT', baseContext);
      expect(result.state).toBe('processing');
      expect(result.context.status).toBe('processing');
    });

    it('PAYMENT_SUBMIT -> processing', () => {
      const result = checkoutTransition('idle', 'PAYMENT_SUBMIT', baseContext);
      expect(result.state).toBe('processing');
      expect(result.context.status).toBe('processing');
    });

    it('SUCCESS -> idle (no transition)', () => {
      const result = checkoutTransition('idle', 'SUCCESS', baseContext);
      expect(result.state).toBe('idle');
      expect(result.context).toEqual(baseContext);
    });

    it('ERROR -> idle (no transition)', () => {
      const result = checkoutTransition('idle', 'ERROR', baseContext);
      expect(result.state).toBe('idle');
    });
  });

  describe('State: processing', () => {
    const processingContext: CheckoutContext = {
      ...baseContext,
      status: 'processing',
    };

    it('SUCCESS -> complete', () => {
      const result = checkoutTransition('processing', 'SUCCESS', processingContext);
      expect(result.state).toBe('complete');
      expect(result.context.status).toBe('complete');
      expect(result.context.errorMessage).toBeNull();
    });

    it('ERROR -> idle with error preserved', () => {
      const contextWithError: CheckoutContext = {
        ...processingContext,
        errorMessage: 'Payment declined',
      };
      const result = checkoutTransition('processing', 'ERROR', contextWithError);
      expect(result.state).toBe('idle');
      expect(result.context.status).toBe('idle');
      expect(result.context.errorMessage).toBe('Payment declined');
    });

    it('CHECKOUT_CLICK -> processing (no change)', () => {
      const result = checkoutTransition('processing', 'CHECKOUT_CLICK', processingContext);
      expect(result.state).toBe('processing');
    });

    it('ADDRESS_SUBMIT -> processing (no change)', () => {
      const result = checkoutTransition('processing', 'ADDRESS_SUBMIT', processingContext);
      expect(result.state).toBe('processing');
    });

    it('PAYMENT_SUBMIT -> processing (no change)', () => {
      const result = checkoutTransition('processing', 'PAYMENT_SUBMIT', processingContext);
      expect(result.state).toBe('processing');
    });
  });

  describe('State: complete', () => {
    const completeContext: CheckoutContext = {
      ...baseContext,
      status: 'complete',
      clientSecret: 'secret_123',
      reservationId: 'res_123',
      expiresAt: Date.now() + 3600000,
    };

    it('CHECKOUT_CLICK -> idle (resets context)', () => {
      const result = checkoutTransition('complete', 'CHECKOUT_CLICK', completeContext);
      expect(result.state).toBe('idle');
      expect(result.context.status).toBe('idle');
      expect(result.context.clientSecret).toBeNull();
      expect(result.context.reservationId).toBeNull();
      expect(result.context.expiresAt).toBeNull();
      expect(result.context.idempotencyKey).toBeNull();
      expect(result.context.errorMessage).toBeNull();
    });

    it('other events -> complete (no transition)', () => {
      const events: CheckoutEvent[] = ['ADDRESS_SUBMIT', 'PAYMENT_SUBMIT', 'SUCCESS', 'ERROR'];

      events.forEach(event => {
        const result = checkoutTransition('complete', event, completeContext);
        expect(result.state).toBe('complete');
        expect(result.context).toEqual(completeContext);
      });
    });
  });

  describe('Scenarios', () => {
    it('happy path: idle -> processing -> complete', () => {
      let state: CheckoutState = 'idle';
      let context = baseContext;

      // User clicks checkout
      ({ state, context } = checkoutTransition(state, 'CHECKOUT_CLICK', context));
      expect(state).toBe('processing');

      // Payment succeeds
      ({ state, context } = checkoutTransition(state, 'SUCCESS', context));
      expect(state).toBe('complete');
    });

    it('error recovery: processing -> idle -> processing -> complete', () => {
      let state: CheckoutState = 'idle';
      let context = baseContext;

      // User submits payment
      ({ state, context } = checkoutTransition(state, 'PAYMENT_SUBMIT', context));
      expect(state).toBe('processing');

      // Payment fails
      context = { ...context, errorMessage: 'Card declined' };
      ({ state, context } = checkoutTransition(state, 'ERROR', context));
      expect(state).toBe('idle');
      expect(context.errorMessage).toBe('Card declined');

      // User retries
      ({ state, context } = checkoutTransition(state, 'PAYMENT_SUBMIT', context));
      expect(state).toBe('processing');
      expect(context.errorMessage).toBeNull(); // Error cleared on retry

      // Payment succeeds
      ({ state, context } = checkoutTransition(state, 'SUCCESS', context));
      expect(state).toBe('complete');
    });

    it('restart after complete: resets all state', () => {
      let state: CheckoutState = 'complete';
      let context: CheckoutContext = {
        ...baseContext,
        status: 'complete',
        clientSecret: 'old_secret',
        reservationId: 'old_res',
        expiresAt: 1234567890,
        idempotencyKey: 'old_key',
      };

      // User starts new checkout
      ({ state, context } = checkoutTransition(state, 'CHECKOUT_CLICK', context));
      expect(state).toBe('idle');
      expect(context.clientSecret).toBeNull();
      expect(context.reservationId).toBeNull();
      expect(context.expiresAt).toBeNull();
      expect(context.idempotencyKey).toBeNull();
    });

    it('all scenario definitions from fixtures', () => {
      Object.values(FSM_SCENARIOS).forEach((steps) => {
        let state: CheckoutState = 'idle';
        let context = baseContext;

        steps.forEach((step) => {
          // Verify starting state
          expect(state).toBe(step.state);

          // Apply event
          ({ state, context } = checkoutTransition(state, step.event, context));

          // Verify expected state
          expect(state).toBe(step.expected);
        });
      });
    });
  });

  describe('Invalid transitions', () => {
    it('returns unchanged state for invalid transitions', () => {
      const result = checkoutTransition('complete', 'PAYMENT_SUBMIT', completeContext);
      expect(result).toEqual({ state: 'complete', context: completeContext });
    });
  });
});

// Helper for complete context
const completeContext: CheckoutContext = {
  status: 'complete',
  errorMessage: null,
  idempotencyKey: 'key_123',
  clientSecret: 'secret_123',
  reservationId: 'res_123',
  expiresAt: Date.now(),
};
