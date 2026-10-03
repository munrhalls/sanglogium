"use client";

import React from 'react';
import { formatPriceMajor } from '@/lib/utils/price';

interface PriceProps {
  /** Price in major units (dollars) — e.g. the output of `centsToDisplay`. */
  value: number;
  className?: string;
}

export function Price({ value, className }: PriceProps) {
  return (
    <span className={className || "type-price tabular-nums"}>
      {formatPriceMajor(value)}
    </span>
  );
}
