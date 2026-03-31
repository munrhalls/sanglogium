"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { isFilterActive, toggleFilter } from '@/lib/filters/urlParams';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

interface FilterSidebarProps {
  filters: FilterGroup[];
}

export function FilterSidebar({ filters }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleToggleFilter = (field: string, value: string) => {
    const newUrl = toggleFilter(pathname, new URLSearchParams(searchParams.toString()), field, value);
    router.push(newUrl, { scroll: false });
  };

  return (
    <aside
      data-testid="filter-sidebar"
      className="w-full h-full bg-surface-elevated lg:border-r border-border-secondary"
    >
      <div className="p-4 lg:p-6 space-y-6">
        <h3 className="type-overline">
          Filters
        </h3>

        <form className="space-y-6">
          {filters.map((group) => (
            <fieldset key={group.field} className="space-y-3">
              <legend className="type-overline">{group.label}</legend>

              <div className="space-y-2">
                {group.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 text-body text-brand-200 hover:text-brand-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name={group.field}
                      value={option.value}
                      checked={isFilterActive(searchParams, group.field, option.value)}
                      onChange={() => handleToggleFilter(group.field, option.value)}
                      className="w-4 h-4 appearance-none border border-border-secondary bg-surface-elevated checked:bg-accent-500 checked:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-surface-elevated cursor-pointer"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </form>
      </div>
    </aside>
  );
}
