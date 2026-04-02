"use client";

import { useEffect } from "react";
import { useBasketStore } from "@/store/store";

// TODO: This hook appears redundant. OrderSuccessClient already has inline useEffect for clearing.
// Audit result: No other imports found in codebase. Consider removing after confirming no other usage.
export function useClearBasketOnMount() {
  const clearBasket = useBasketStore((s) => s.clearBasket);

  useEffect(() => {
    clearBasket();
  }, [clearBasket]);
}
