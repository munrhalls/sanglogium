"use client";

import React from "react";

interface QuantitySelectorProps {
  quantity: number;
  min?: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  min = 1,
  max,
  onIncrement,
  onDecrement,
  size = "md",
  disabled = false,
}: QuantitySelectorProps) {
  const canDecrement = quantity > min && !disabled;
  const canIncrement = quantity < max && !disabled;

  const btnSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const qtySize = size === "sm" ? "w-8" : "w-12";
  const gap = size === "sm" ? "gap-1" : "gap-2";

  return (
    <div className={`flex items-center ${gap}`}>
      <button
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-disabled={!canDecrement}
        className={`btn-secondary ${btnSize} flex items-center justify-center disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={`${qtySize} text-center type-body text-primary`}
        role="status"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        disabled={!canIncrement}
        aria-disabled={!canIncrement}
        data-testid="increment"
        className={`btn-secondary ${btnSize} flex items-center justify-center disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
