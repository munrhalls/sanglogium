"use client"

import { useEffect, useRef } from "react";

interface Props {
  transactionId: string;
  value: number;
}

export function SuccessAnalytics({ transactionId, value }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (typeof window === "undefined" || !(window as unknown as Record<string, unknown>).gtag) return;

    const gtag = (window as unknown as Record<string, unknown>).gtag as (...args: unknown[]) => void;
    gtag("event", "purchase", {
      transaction_id: transactionId,
      value: value / 100,
      currency: "PLN",
      items: [],
    });
  }, []);

  return null;
}
