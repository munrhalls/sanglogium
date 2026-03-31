"use client";

import React from 'react';

export function ActiveFilters() {
  return (
    <div data-testid="active-filters" className="border-2 border-blue-500">
      <button type="button">
        <span>Filter Label</span>
        <span>×</span>
      </button>
      <button type="button">Clear all</button>
    </div>
  );
}
