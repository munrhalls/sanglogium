"use client"

import { useEffect } from "react";
import { usePreCheckout } from "./checkout/usePreCheckout";

/**
 * BasketPage - Cancel URL Back-Navigation Handler
 *
 * Detects ?checkout=cancelled query param on mount,
 * dispatches RESET if machine is in SUCCESS state, and cleans the URL.
 * Per §9 "Cancel URL and back-navigation".
 */
export default function BasketPage() {
  const { state: checkoutState, reset } = usePreCheckout();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "cancelled") {
      if (checkoutState === "SUCCESS") {
        reset(); // dispatches RESET from SUCCESS → fires lock release
      }

      // Clean URL regardless of state to prevent re-trigger on re-render
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [checkoutState, reset]);

  return null; // This component only handles side effects
}
