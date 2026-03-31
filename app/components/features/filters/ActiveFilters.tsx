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
        className="px-4 py-3 bg-surface-elevated border border-secondary-700 text-body text-brand-200 uppercase tracking-editorial hover:border-brand-400 hover:text-brand-100 transition-colors lg:hidden mb-2 cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
}
