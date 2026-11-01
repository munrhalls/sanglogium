import React from 'react';

interface NoResultsProps {
  /**
   * True when the zero-result view is the product of the shopper's selections
   * (not a genuinely empty category). The chips above the grid then hold the
   * way out ("Clear all", or one chip at a time), so this only says so.
   */
  filtersActive?: boolean;
}

export function NoResults({ filtersActive = false }: NoResultsProps) {
  return (
    <div className="py-16 text-center space-y-4">
      <p className="type-body text-secondary">
        {filtersActive
          ? 'No products match the selected filters.'
          : 'No products found.'}
      </p>

      {filtersActive && (
        <p className="type-caption text-secondary">
          Try removing a filter above.
        </p>
      )}
    </div>
  );
}
