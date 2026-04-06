/**
 * Pre-checkout finite state machine
 * Pure transition logic - no side effects
 */

import type {
  PreCheckoutState,
  PreCheckoutEvent,
  PreCheckoutContext,
  TransitionResult
} from "./preCheckoutTypes";

/**
 * Transition function for the pre-checkout state machine
 * Implements all state transitions per §3
 */
export function transition(
  state: PreCheckoutState,
  event: PreCheckoutEvent,
  context: PreCheckoutContext
): TransitionResult {
  switch (state) {
    case "IDLE":
      return handleIdleState(event, context);

    case "PROCESSING":
      return handleProcessingState(event, context);

    case "ERROR_NETWORK":
      return handleNetworkErrorState(event, context);

    case "ERROR_VALIDATION":
      return handleValidationErrorState(event, context);

    case "SUCCESS":
      return handleSuccessState(event, context);

    default:
      // Invalid state - return unchanged
      return { state, context };
  }
}

function handleIdleState(
  event: PreCheckoutEvent,
  context: PreCheckoutContext
): TransitionResult {
  switch (event.type) {
    case "START_VALIDATION":
      return {
        state: "PROCESSING",
        context: {
          ...context,
          idempotencyKey: crypto.randomUUID(),
          discrepancy: null
        }
      };

    default:
      return { state: "IDLE", context };
  }
}

function handleProcessingState(
  event: PreCheckoutEvent,
  context: PreCheckoutContext
): TransitionResult {
  switch (event.type) {
    case "FAIL_NETWORK":
      return {
        state: "ERROR_NETWORK",
        context: {
          ...context,
          idempotencyKey: null
        }
      };

    case "FAIL_VALIDATION":
      return {
        state: "ERROR_VALIDATION",
        context: {
          ...context,
          discrepancy: event.payload,
          idempotencyKey: null
        }
      };

    case "PASS_VALIDATION":
      return {
        state: "SUCCESS",
        context: {
          ...context,
          stripeUrl: event.stripeUrl
          // Keep idempotencyKey per §4
        }
      };

    default:
      return { state: "PROCESSING", context };
  }
}

function handleNetworkErrorState(
  event: PreCheckoutEvent,
  context: PreCheckoutContext
): TransitionResult {
  switch (event.type) {
    case "START_VALIDATION":
      return {
        state: "PROCESSING",
        context: {
          ...context,
          idempotencyKey: crypto.randomUUID(),
          discrepancy: null
        }
      };

    case "FAIL_NETWORK":
      // Already in ERROR_NETWORK - no change
      return { state: "ERROR_NETWORK", context };

    case "RESET":
      return {
        state: "IDLE",
        context: createInitialContext()
      };

    default:
      return { state: "ERROR_NETWORK", context };
  }
}

function handleValidationErrorState(
  event: PreCheckoutEvent,
  context: PreCheckoutContext
): TransitionResult {
  switch (event.type) {
    case "START_VALIDATION":
      // Guard: only allow if discrepancy is null (mutations cleared)
      if (context.discrepancy !== null) {
        return { state: "ERROR_VALIDATION", context };
      }
      return {
        state: "PROCESSING",
        context: {
          ...context,
          idempotencyKey: crypto.randomUUID(),
          discrepancy: null
        }
      };

    case "RESET":
      return {
        state: "IDLE",
        context: createInitialContext()
      };

    default:
      return { state: "ERROR_VALIDATION", context };
  }
}

function handleSuccessState(
  event: PreCheckoutEvent,
  context: PreCheckoutContext
): TransitionResult {
  switch (event.type) {
    case "FAIL_NETWORK":
      // Can transition from SUCCESS to ERROR_NETWORK
      return {
        state: "ERROR_NETWORK",
        context: {
          ...context,
          idempotencyKey: null
        }
      };

    case "RESET":
      return {
        state: "IDLE",
        context: createInitialContext()
      };

    default:
      return { state: "SUCCESS", context };
  }
}

function createInitialContext(): PreCheckoutContext {
  return {
    idempotencyKey: null,
    discrepancy: null,
    stripeUrl: null,
    redirectWatchdogId: null
  };
}
