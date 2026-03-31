"use client";

import React from 'react';

interface PriceProps {
  value: number;
  currency?: string;
}

export function Price({ value, currency = 'USD' }: PriceProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return <span className="type-price tabular-nums">{formatted}</span>;
}
