/**
 * Pre-checkout state machine types
 * Research-validated implementation from flow per ux slice.md
 */

// FSM State Shape (research-validated)
export interface CheckoutState {
  status: 'idle' | 'processing' | 'complete';
  errorMessage: string | null;            // null when no error
  idempotencyKey: string | null;
  clientSecret: string | null;
  reservationId: string | null;
  expiresAt: number | null;               // Unix timestamp ms
}

// FSM Events
export type CheckoutEvent =
  | { type: 'CHECKOUT_CLICK' }
  | { type: 'SET_ADDRESS_SUBMIT' }
  | { type: 'SET_PAYMENT_COMPLETE' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

// FSM Context (extends state with additional runtime data)
export interface CheckoutContext extends CheckoutState {
  // Additional runtime context can be added here
}

// Transition result
export interface TransitionResult {
  state: CheckoutState;
  context: CheckoutContext;
}
