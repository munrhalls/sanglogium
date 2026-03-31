import React from 'react';

interface SortDropdownProps {
  currentSort?: string;
}

export function SortDropdown({ currentSort = 'featured' }: SortDropdownProps) {
  return (
    <div data-testid="sort-dropdown" className="w-full sm:w-[200px]">
      <label htmlFor="sort" className="sr-only">Sort by</label>
      <select
        id="sort"
        value={currentSort}
        className="w-full px-4 py-3 bg-surface-elevated border border-secondary-700 text-body text-brand-200 appearance-none cursor-pointer hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 transition-colors"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C7C6C4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 12px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.25em 1.25em',
          paddingRight: '40px',
        }}
      >
        <option value="featured">Featured</option>
        <option value="displayPrice:asc">Price: Low to High</option>
        <option value="displayPrice:desc">Price: High to Low</option>
        <option value="name:asc">Name: A-Z</option>
        <option value="name:desc">Name: Z-A</option>
      </select>
    </div>
  );
}
