"use client";

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { isFilterActive, toggleFilter } from '@/lib/filters/urlParams';
import { Checkbox } from '@/app/components/ui/Checkbox';

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
      className="hidden lg:block w-60 sticky top-desktop-header-h"
    >
      <div className="bg-surface-elevated border border-border-secondary rounded-sm p-6 space-y-6">
        <h3 className="type-overline text-caption">
          Filters
        </h3>

        <form className="space-y-6">
          {filters.map((group) => (
            <fieldset key={group.field} className="space-y-3">
              <legend className="type-overline text-accent-500 section-header-anchor">
                {group.label}
              </legend>

              <div className="space-y-2">
                {group.options.map((option) => {
                  const isChecked = isFilterActive(searchParams, group.field, option.value);
                  return (
                    <Checkbox
                      key={option.value}
                      name={group.field}
                      value={option.value}
                      checked={isChecked}
                      onChange={() => handleToggleFilter(group.field, option.value)}
                      label={option.label}
                    />
                  );
                })}
              </div>
            </fieldset>
          ))}
        </form>
      </div>
    </aside>
  );
}
