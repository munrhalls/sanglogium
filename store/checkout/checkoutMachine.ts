// Checkout FSM - UX Slice Implementation
// Simplified states following research-validated flow

export type CheckoutState = 'idle' | 'processing' | 'complete';

export type CheckoutEvent =
  | 'CHECKOUT_CLICK'
  | 'ADDRESS_SUBMIT'
  | 'PAYMENT_SUBMIT'
  | 'SUCCESS'
  | 'ERROR';

export type CheckoutContext = {
  status: CheckoutState;
  errorMessage: string | null;
  idempotencyKey: string | null;
  clientSecret: string | null;
  reservationId: string | null;
  expiresAt: number | null; // Unix timestamp ms
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  basket?: Array<{_id: string, quantity: number, stripePriceId: string}>;
};

// Pure FSM transitions - simplified per UX slice
export function checkoutTransition(
  state: CheckoutState,
  event: CheckoutEvent,
  context: CheckoutContext
): { state: CheckoutState; context: CheckoutContext } {

  switch (state) {
    case 'idle':
      if (event === 'CHECKOUT_CLICK' || event === 'ADDRESS_SUBMIT' || event === 'PAYMENT_SUBMIT') {
        return {
          state: 'processing',
          context: { ...context, status: 'processing', errorMessage: null }
        };
      }
      break;

    case 'processing':
      if (event === 'SUCCESS') {
        return {
          state: 'complete',
          context: { ...context, status: 'complete', errorMessage: null }
        };
      }
      if (event === 'ERROR') {
        return {
          state: 'idle',
          context: { ...context, status: 'idle', errorMessage: context.errorMessage }
        };
      }
      break;

    case 'complete':
      // Reset for next checkout
      if (event === 'CHECKOUT_CLICK') {
        return {
          state: 'idle',
          context: {
            status: 'idle',
            errorMessage: null,
            idempotencyKey: null,
            clientSecret: null,
            reservationId: null,
            expiresAt: null
          }
        };
      }
      break;
  }

  // Invalid state transition - return unchanged
  return { state, context };
}

// React hook for checkout state management
import { useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  status: 'idle' as CheckoutState,
  errorMessage: null,
  idempotencyKey: null,
  clientSecret: null,
  reservationId: null,
  expiresAt: null
};

// Enhanced reducer that handles context updates
function checkoutReducer(state: CheckoutContext, action: { type: CheckoutEvent; payload?: any }): CheckoutContext {
  const { state: newState, context } = checkoutTransition(state.status, action.type, state);

  // Apply any payload updates
  if (action.payload) {
    Object.assign(context, action.payload);
  }

  return context;
}

export function useCheckoutMachine() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const generateIdempotencyKey = useCallback(() => {
    return `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const startCheckout = useCallback(() => {
    const idempotencyKey = generateIdempotencyKey();
    dispatch({ type: 'CHECKOUT_CLICK', payload: { idempotencyKey } });
    return idempotencyKey;
  }, [generateIdempotencyKey]);

  const submitAddress = useCallback((idempotencyKey: string) => {
    dispatch({ type: 'ADDRESS_SUBMIT' });
    return idempotencyKey;
  }, []);

  const submitPayment = useCallback(() => {
    dispatch({ type: 'PAYMENT_SUBMIT' });
  }, []);

  const handleSuccess = useCallback((data: {
    clientSecret?: string;
    reservationId?: string;
    expiresAt?: number;
  }) => {
    dispatch({ type: 'SUCCESS', payload: data });
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    dispatch({ type: 'ERROR', payload: { errorMessage } });
  }, []);

  return {
    ...state,
    startCheckout,
    submitAddress,
    submitPayment,
    handleSuccess,
    handleError,
    isProcessing: state.status === 'processing',
    isComplete: state.status === 'complete',
    hasError: state.errorMessage !== null
  };
}
