"use client"

import { useState, useEffect, useRef } from "react";
import { PreCheckoutMachine } from "@/store/preCheckout/preCheckoutMachine";
import type { CheckoutState, CheckoutContext } from "@/store/preCheckout/preCheckoutTypes";
import { useRouter } from "next/navigation";

/**
 * usePreCheckout - Simplified Hook for new PreCheckoutMachine
 * Generates idempotency key and navigates to address page on checkout click
 */
export function usePreCheckout(): {
  state: CheckoutState['status'];
  context: CheckoutContext;
  checkout: () => void;
  retry: () => void;
  acceptAndContinue: () => void;
  reset: () => void;
} {
  const router = useRouter();
  const [machine] = useState(() => new PreCheckoutMachine());
  const [state, setState] = useState(machine.getState());
  const [context, setContext] = useState(machine.getContext());

  // Update local state when machine state changes
  const updateState = () => {
    setState(machine.getState());
    setContext(machine.getContext());
  };

  // Navigate to address page when checkout click completes
  useEffect(() => {
    if (state.status === 'processing' && state.idempotencyKey) {
      console.log('Checkout click processed, navigating to address page');
      console.log('Idempotency key:', state.idempotencyKey);

      // Reset to idle for address slice
      machine.setAddressSubmit();
      updateState();

      // Navigate to address page
      router.push('/checkout/address');
    }
  }, [state.status, state.idempotencyKey, router]);

  // Public API methods
  const checkout = () => {
    console.log('Checkout button clicked');
    machine.checkoutClick();
    updateState();
  };

  const retry = () => {
    console.log('Retry checkout');
    machine.checkoutClick();
    updateState();
  };

  const reset = () => {
    console.log('Reset checkout state');
    machine.reset();
    updateState();
  };

  const acceptAndContinue = () => {
    console.log('Accept and continue (not implemented for new flow)');
    // This method is kept for compatibility but not used in the simplified flow
  };

  return {
    state: state.status,
    context,
    checkout,
    retry,
    acceptAndContinue,
    reset
  };
}
