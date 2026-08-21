"use client";

import React from 'react';

export function EmptyResults() {
  return (
    <div data-testid="empty-results" className="py-16 text-center space-y-4">
      <p className="type-body text-secondary">
        No products found.
      </p>
    </div>
  );
}
