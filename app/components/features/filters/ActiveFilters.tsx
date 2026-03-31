import React from 'react';

interface Filter {
  field: string;
  value: string;
  label: string;
}

interface ActiveFiltersProps {
  filters: Filter[];
}

export function ActiveFilters({ filters }: ActiveFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div data-testid="active-filters" className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={`${filter.field}:${filter.value}`}
          type="button"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-elevated border border-secondary-700 text-body text-brand-200 hover:border-brand-400 hover:text-brand-100 transition-colors cursor-pointer"
        >
          <span>{filter.label}</span>
          <span aria-label={`Remove ${filter.label} filter`} className="text-secondary-400 hover:text-brand-400">X</span>
        </button>
      ))}

      <button
        type="button"
        className="text-body text-secondary-400 hover:text-brand-400 underline cursor-pointer transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
