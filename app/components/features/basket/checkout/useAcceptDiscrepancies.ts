"use client";

import type { PreCheckoutEvent, DiscrepancyPayload } from "../../../../../store/preCheckout/preCheckoutTypes";
import type { BasketPayload } from "../../../../../app/actions/checkout/validateBasket.types";
import { useCheckoutAction } from "./useCheckoutAction";
import { useBasketStore } from "../../../../../store/store";

export function useAcceptDiscrepancies(
  dispatch: (event: PreCheckoutEvent) => void,
  executeValidation: ReturnType<typeof useCheckoutAction>["executeValidation"],
  basketPayload: BasketPayload
): {
  acceptAndContinue: (discrepancy: DiscrepancyPayload,
                              idempotencyKey: string) => Promise<void>;
} {
  const acceptAndContinue = async (
    discrepancy: DiscrepancyPayload,
    idempotencyKey: string
  ): Promise<void> => {
    if (discrepancy.type === "STRIPE_CONFIG") {
      // No mutation possible. Do not dispatch START_VALIDATION.
      // Log warning. Button should have been hidden — this is a safety guard.
      console.warn("STRIPE_CONFIG discrepancy cannot be auto-accepted");
      return;
    }

    const basketStore = useBasketStore.getState();
    let mutationsSucceeded = true;

    try {
      if (discrepancy.type === "PRICE") {
        for (const item of discrepancy.items) {
          basketStore.updateItemPrice(item.id, item.actual);
          // If basketStore throws: mutationsSucceeded = false; break;
        }
      }

      if (discrepancy.type === "INVENTORY") {
        for (const item of discrepancy.items) {
          if (item.available === 0) {
            basketStore.removeItem(item.id);
          } else {
            basketStore.updateItemQuantity(item.id, item.available);
          }
        }
      }
    } catch (error) {
      mutationsSucceeded = false;
      console.error("Basket mutations failed:", error);
    }

    if (!mutationsSucceeded) {
      // Do not dispatch START_VALIDATION. Surface error to user (separate concern).
      return;
    }

    // Mutations succeeded. Now dispatch (new idempotency key generated inside machine).
    const newKey = crypto.randomUUID();
    dispatch({ type: "START_VALIDATION" });
    executeValidation(basketPayload, newKey);
  };

  return { acceptAndContinue };
}
