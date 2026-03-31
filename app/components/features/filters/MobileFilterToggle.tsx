import React from 'react';

export function MobileFilterToggle() {
  return (
    <button
      type="button"
      data-testid="mobile-filter-toggle"
      className="px-4 py-2 border border-gray-300 lg:hidden mb-2"
    >
      Filters
    </button>
  );
}
