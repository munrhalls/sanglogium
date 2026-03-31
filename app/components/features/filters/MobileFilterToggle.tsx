import React from 'react';

export function MobileFilterToggle() {
  return (
    <button
      type="button"
      data-testid="mobile-filter-toggle"
      className="px-4 py-3 bg-surface-elevated border border-secondary-700 text-body text-brand-200 uppercase tracking-editorial hover:border-brand-400 hover:text-brand-100 transition-colors lg:hidden mb-2 cursor-pointer"
    >
      Filters
    </button>
  );
}
