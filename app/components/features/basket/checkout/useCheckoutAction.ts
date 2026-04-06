"use client";

import type { PreCheckoutEvent } from "../../../../../store/preCheckout/preCheckoutTypes";
import type { BasketPayload } from "../../../../../app/actions/checkout/validateBasket.types";
import { validateBasket } from "../../../../../app/actions/checkout";

export function useCheckoutAction(
  dispatch: (event: PreCheckoutEvent) => void
): { executeValidation: (payload: BasketPayload, idempotencyKey: string) => void } {
  const executeValidation = async (payload: BasketPayload, idempotencyKey: string): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const result = await validateBasket(payload, idempotencyKey, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (result.outcome === "PASS") {
        dispatch({ type: "PASS_VALIDATION", stripeUrl: result.stripeUrl });
      } else if (result.outcome === "FAIL_VALIDATION") {
        dispatch({ type: "FAIL_VALIDATION", payload: result.discrepancy });
      } else {
        dispatch({ type: "FAIL_NETWORK" });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      dispatch({ type: "FAIL_NETWORK" });
    }
  };

  return { executeValidation };
}
