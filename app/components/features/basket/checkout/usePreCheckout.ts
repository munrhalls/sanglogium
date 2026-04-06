"use client"

import { useReducer, useRef, useEffect } from "react";
import { transition } from "@/store/preCheckout/preCheckoutMachine";
import type { PreCheckoutState, PreCheckoutContext, PreCheckoutEvent } from "@/store/preCheckout/preCheckoutTypes";
import { useCheckoutAction } from "./useCheckoutAction";
import { useSuccessHandler } from "./useSuccessHandler";
import { useAcceptDiscrepancies } from "./useAcceptDiscrepancies";
import { useBasketStore, selectBasketTotal } from "@/store/store";
import type { BasketPayload } from "@/app/actions/checkout/validateBasket.types";

/**
 * usePreCheckout — Orchestrator Hook
 * Wires SC1 machine + SC3 action + SC4 success handler + SC5 accept handler
 * into one composable unit consumed by the basket UI component
 */
export function usePreCheckout(): {
  state: PreCheckoutState;
  context: PreCheckoutContext;
  checkout: () => void;
  retry: () => void;
  acceptAndContinue: () => void;
  reset: () => void;
} {
  // State machine with useReducer
  const [{ state, context }, dispatch] = useReducer(
    (prev: { state: PreCheckoutState; context: PreCheckoutContext }, event: PreCheckoutEvent) => {
      const result = transition(prev.state, event, prev.context);
      return { state: result.state, context: result.context };
    },
    { state: "IDLE" as PreCheckoutState, context: createInitialContext() }
  );

  // Watchdog ref for SUCCESS state timeout
  const watchdogRef = useRef<number | null>(null);

  // Child hooks
  const { executeValidation } = useCheckoutAction(dispatch);
  const { onSuccessEntry, onResetFromSuccess } = useSuccessHandler(dispatch);
  const { acceptAndContinue: acceptAndContinueHandler } = useAcceptDiscrepancies(dispatch, executeValidation, getBasketPayload());

  // Get basket snapshot for validation
  function getBasketPayload(): BasketPayload {
    const basketStore = useBasketStore.getState();
    return {
      items: basketStore.basket.map(item => ({
        _id: item._id,
        quantity: item.quantity
      })),
      total: selectBasketTotal(basketStore)
    };
  }

  // Create initial context
  function createInitialContext(): PreCheckoutContext {
    return {
      idempotencyKey: null,
      discrepancy: null,
      stripeUrl: null,
      redirectWatchdogId: null
    };
  }

  // Public API methods
  const checkout = () => {
    const key = crypto.randomUUID(); // key generated here for IDLE path
    dispatch({ type: "START_VALIDATION" });
    executeValidation(getBasketPayload(), key);
  };

  const retry = () => {
    const key = crypto.randomUUID();
    dispatch({ type: "START_VALIDATION" });
    executeValidation(getBasketPayload(), key);
  };

  const reset = () => {
    if (state === "SUCCESS") {
      onResetFromSuccess(context.idempotencyKey);
      clearTimeout(watchdogRef.current ?? undefined);
      watchdogRef.current = null;
    }
    dispatch({ type: "RESET" });
  };

  const acceptAndContinue = () => {
    if (!context.discrepancy) return;
    acceptAndContinueHandler(context.discrepancy, context.idempotencyKey ?? "");
  };

  // SUCCESS state entry effect
  useEffect(() => {
    if (state === "SUCCESS" && context.stripeUrl) {
      onSuccessEntry(context.stripeUrl, watchdogRef);
    }
  }, [state, context.stripeUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(watchdogRef.current ?? undefined);
    };
  }, []);

  return {
    state,
    context,
    checkout,
    retry,
    acceptAndContinue,
    reset
  };
}
