/**
 * Pre-checkout finite state machine
 * Research-validated 3-state implementation from flow per ux slice.md
 */

import type {
  CheckoutState,
  CheckoutEvent,
  CheckoutContext,
  TransitionResult
} from "./preCheckoutTypes";

/**
 * Transition function for the pre-checkout state machine
 * Implements 3 states: idle | processing | complete
 */
export function transition(
  state: CheckoutState['status'],
  event: CheckoutEvent,
  context: CheckoutContext
): TransitionResult {
  switch (state) {
    case "idle":
      return handleIdleState(event, context);

    case "processing":
      return handleProcessingState(event, context);

    case "complete":
      return handleCompleteState(event, context);

    default:
      // Invalid state - return unchanged
      return { state: context, context };
  }
}

function handleIdleState(
  event: CheckoutEvent,
  context: CheckoutContext
): TransitionResult {
  switch (event.type) {
    case "CHECKOUT_CLICK":
      return {
        state: {
          ...context,
          status: 'processing',
          idempotencyKey: `checkout_${Date.now()}_${crypto.randomUUID().slice(-8)}`,
          errorMessage: null
        },
        context: {
          ...context,
          status: 'processing',
          idempotencyKey: `checkout_${Date.now()}_${crypto.randomUUID().slice(-8)}`,
          errorMessage: null
        }
      };

    case "RESET":
      return {
        state: createInitialState(),
        context: createInitialState()
      };

    default:
      return { state: context, context };
  }
}

function handleProcessingState(
  event: CheckoutEvent,
  context: CheckoutContext
): TransitionResult {
  switch (event.type) {
    case "SET_ADDRESS_SUBMIT":
      return {
        state: {
          ...context,
          status: 'idle',
          errorMessage: null
        },
        context: {
          ...context,
          status: 'idle',
          errorMessage: null
        }
      };

    case "SET_ERROR":
      return {
        state: {
          ...context,
          status: 'idle',
          errorMessage: event.payload
        },
        context: {
          ...context,
          status: 'idle',
          errorMessage: event.payload
        }
      };

    default:
      return { state: context, context };
  }
}

function handleCompleteState(
  event: CheckoutEvent,
  context: CheckoutContext
): TransitionResult {
  switch (event.type) {
    case "RESET":
      return {
        state: createInitialState(),
        context: createInitialState()
      };

    default:
      return { state: context, context };
  }
}

function createInitialState(): CheckoutState {
  return {
    status: 'idle',
    errorMessage: null,
    idempotencyKey: null,
    clientSecret: null,
    reservationId: null,
    expiresAt: null
  };
}

/**
 * FSM Machine with state and methods
 */
export class PreCheckoutMachine {
  private state: CheckoutState;
  private context: CheckoutContext;

  constructor() {
    this.state = createInitialState();
    this.context = { ...this.state };
  }

  /**
   * Generate UUIDv4 idempotency key and set status to processing
   */
  checkoutClick(): void {
    const result = transition(this.state.status, { type: 'CHECKOUT_CLICK' }, this.context);
    this.state = result.state;
    this.context = result.context;
  }

  /**
   * Set status to idle for address slice
   */
  setAddressSubmit(): void {
    const result = transition(this.state.status, { type: 'SET_ADDRESS_SUBMIT' }, this.context);
    this.state = result.state;
    this.context = result.context;
  }

  /**
   * Set status to complete
   */
  setPaymentComplete(): void {
    this.state = {
      ...this.state,
      status: 'complete'
    };
    this.context = {
      ...this.context,
      status: 'complete'
    };
  }

  /**
   * Set error message and return to idle
   */
  setError(message: string): void {
    const result = transition(this.state.status, { type: 'SET_ERROR', payload: message }, this.context);
    this.state = result.state;
    this.context = result.context;
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    const result = transition(this.state.status, { type: 'RESET' }, this.context);
    this.state = result.state;
    this.context = result.context;
  }

  /**
   * Get current state
   */
  getState(): CheckoutState {
    return this.state;
  }

  /**
   * Get current context
   */
  getContext(): CheckoutContext {
    return this.context;
  }
}
