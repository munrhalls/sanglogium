import React from 'react';

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
  return (
    <aside
      data-testid="filter-sidebar"
      className="w-full h-full bg-surface-subtle lg:border-r border-secondary-700"
    >
      <div className="p-4 lg:p-6 space-y-6">
        <h3 className="text-h4 font-semibold text-headline tracking-editorial uppercase">
          Filters
        </h3>

        <form className="space-y-6">
          {filters.map((group) => (
            <fieldset key={group.field} className="space-y-3">
              <legend className="text-small font-medium text-secondary uppercase tracking-editorial">{group.label}</legend>

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
                      className="w-4 h-4 accent-accent-500 cursor-pointer"
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
