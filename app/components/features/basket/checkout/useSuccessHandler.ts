"use client";

import type { PreCheckoutEvent } from "../../../../../store/preCheckout/preCheckoutTypes";
import { releaseInventoryLock } from "../../../../../app/actions/checkout/releaseInventoryLock";

export function useSuccessHandler(
  dispatch: (event: PreCheckoutEvent) => void
): {
  onSuccessEntry: (stripeUrl: string, watchdogRef: React.MutableRefObject<number | null>) => void;
  onResetFromSuccess: (idempotencyKey: string | null) => void;
} {
  const onSuccessEntry = (stripeUrl: string, watchdogRef: React.MutableRefObject<number | null>): void => {
    // Dispatch navigation event instead of direct navigation
    dispatch({ type: "NAVIGATE_TO_STRIPE", payload: { stripeUrl } });

    // Start 5-second watchdog timer
    watchdogRef.current = window.setTimeout(() => {
      // Only dispatch if watchdog hasn't been cleared
      if (watchdogRef.current !== null) {
        dispatch({ type: "FAIL_NETWORK" });
      }
    }, 5_000) as unknown as number;
  };

  const onResetFromSuccess = (idempotencyKey: string | null): void => {
    if (idempotencyKey) {
      try {
        releaseInventoryLock(idempotencyKey).catch(() => {
          // Fire-and-forget: swallow error. Inngest expiry is safety net.
        });
      } catch {
        // Swallow synchronous errors as well
      }
    }
  };

  return { onSuccessEntry, onResetFromSuccess };
}
