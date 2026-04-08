"use client";

import type { PreCheckoutEvent } from "../../../../../store/preCheckout/preCheckoutTypes";
import type { BasketPayload } from "../../../../../app/actions/checkout/validateBasket.types";
import { validateBasket } from "../../../../../app/actions/checkout";

export function useCheckoutAction(
  dispatch: (event: PreCheckoutEvent) => void
): { executeValidation: (payload: BasketPayload, idempotencyKey: string) => void } {
  const executeValidation = async (payload: BasketPayload, idempotencyKey: string): Promise<void> => {
    console.log('=== CLIENT: CHECKOUT ACTION START ===');
    console.log('Payload:', payload);
    console.log('Idempotency Key:', idempotencyKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      console.log('CLIENT: Calling validateBasket...');
      const result = await validateBasket(payload, idempotencyKey, { signal: controller.signal });
      clearTimeout(timeoutId);

      console.log('CLIENT: validateBasket result:', result);

      if (result.outcome === "PASS") {
        console.log('CLIENT: Dispatching PASS_VALIDATION');
        dispatch({ type: "PASS_VALIDATION", stripeUrl: result.stripeUrl });
      } else if (result.outcome === "FAIL_VALIDATION") {
        console.log('CLIENT: Dispatching FAIL_VALIDATION');
        console.log('Discrepancy:', result.discrepancy);
        dispatch({ type: "FAIL_VALIDATION", payload: result.discrepancy });
      } else {
        console.log('CLIENT: Dispatching FAIL_NETWORK');
        dispatch({ type: "FAIL_NETWORK" });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('CLIENT: validateBasket error:', error);
      dispatch({ type: "FAIL_NETWORK" });
    }
  };

  return { executeValidation };
}
