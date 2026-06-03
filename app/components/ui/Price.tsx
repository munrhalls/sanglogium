"use client";

import React from 'react';

interface PriceProps {
  value: number;
  currency?: string;
  variant?: 'default' | 'summary';
  className?: string;
}

export function Price({ value, currency = 'USD', variant = 'default', className }: PriceProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: variant === 'summary' ? 2 : 0,
    maximumFractionDigits: variant === 'summary' ? 2 : 0,
  }).format(value);

  return <span className={className || "type-price tabular-nums"}>{formatted}</span>;
}
