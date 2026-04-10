"use client";

import { useEffect } from "react";
import type { PreCheckoutEvent, PreCheckoutState, PreCheckoutContext } from "../../../../../store/preCheckout/preCheckoutTypes";
import { logNavigation } from "./useLogger";

export function useNavigationHandler(
  state: PreCheckoutState,
  context: PreCheckoutContext,
  dispatch: (event: PreCheckoutEvent) => void
): void {
  // Listen for NAVIGATE_TO_STRIPE events
  useEffect(() => {
    // This effect will be triggered when the component receives a NAVIGATE_TO_STRIPE event
    // The actual navigation will be handled by the event dispatching mechanism
    // This hook exists to separate navigation concerns from the success handler
  }, [state, context.stripeUrl]);
}

// Navigation dispatcher function to be called when NAVIGATE_TO_STRIPE event is received
export function handleStripeNavigation(stripeUrl: string): void {
  logNavigation(stripeUrl);

  // Perform the actual navigation
  window.location.assign(stripeUrl);
}
