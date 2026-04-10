"use client";

import { useEffect } from "react";
import { useBasketStore, selectBasketTotal } from "@/store/store";
import type { PreCheckoutState, PreCheckoutContext } from "../../../../../store/preCheckout/preCheckoutTypes";
import type { BasketPayload } from "../../../../../app/actions/checkout/validateBasket.types";
import { validateBasket } from "../../../../../app/actions/checkout";
import type { PreCheckoutEvent } from "../../../../../store/preCheckout/preCheckoutTypes";
import { logWorkExecution, logEventDispatch, logResult } from "./useLogger";

export function useWorkTrigger(
  state: PreCheckoutState,
  context: PreCheckoutContext,
  dispatch: (event: PreCheckoutEvent) => void
): void {
  // Get basket payload function
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

  // Execute work when state becomes PROCESSING
  useEffect(() => {
    if (state === "PROCESSING" && context.idempotencyKey) {
      logWorkExecution("validateBasket", { payload: getBasketPayload(), idempotencyKey: context.idempotencyKey });
      executeValidation(getBasketPayload(), context.idempotencyKey);
    }
  }, [state, context.idempotencyKey]);

  const executeValidation = async (payload: BasketPayload, idempotencyKey: string): Promise<void> => {
    console.log(`=== SERVER VALIDATING ===`);
    console.log(`   Expected: validateBasket server call`);
    console.log(`   Payload: ${JSON.stringify(payload)}`);
    console.log(`   IdempotencyKey: ${idempotencyKey}`);
    console.log(`   Calling validateBasket...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const result = await validateBasket(payload, idempotencyKey, { signal: controller.signal });
      clearTimeout(timeoutId);

      console.log(`   Server response: ${JSON.stringify(result)}`);
      console.log(`   Response outcome: ${result.outcome}`);

      if (result.outcome === "PASS") {
        console.log(`   Stripe URL generated: ${result.stripeUrl}`);
        logResult("PASS_VALIDATION", { stripeUrl: result.stripeUrl });
        logEventDispatch("PASS_VALIDATION", { stripeUrl: result.stripeUrl }, "validateBasket");
        dispatch({ type: "PASS_VALIDATION", stripeUrl: result.stripeUrl });
      } else if (result.outcome === "FAIL_VALIDATION") {
        console.log(`   Validation failed: ${JSON.stringify(result.discrepancy)}`);
        logResult("FAIL_VALIDATION", { discrepancy: result.discrepancy });
        logEventDispatch("FAIL_VALIDATION", result.discrepancy, "validateBasket");
        dispatch({ type: "FAIL_VALIDATION", payload: result.discrepancy });
      } else {
        console.log(`   Network/server error occurred`);
        console.log(`   Error details: ${result.error || 'Unknown error'}`);
        logResult("FAIL_NETWORK", { error: result.error || "Network or server error" });
        logEventDispatch("FAIL_NETWORK", undefined, "validateBasket");
        dispatch({ type: "FAIL_NETWORK" });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('CLIENT: validateBasket error:', error);
      console.log(`   Caught error: ${error.message}`);
      console.log(`   Error type: ${error.name}`);
      console.log(`   Aborted: ${controller.signal.aborted}`);

      logResult("FAIL_NETWORK", { error: error.message, type: error.name, aborted: controller.signal.aborted });
      logEventDispatch("FAIL_NETWORK", undefined, "validateBasket");
      dispatch({ type: "FAIL_NETWORK" });
    }
  };
}
