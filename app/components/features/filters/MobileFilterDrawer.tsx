"use client";

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

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
}

export function MobileFilterDrawer({ isOpen, onClose, filters }: MobileFilterDrawerProps) {
  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in drawer */}
      <aside
        data-testid="mobile-filter-drawer"
        className={`
          fixed top-0 left-0 z-50 w-[300px] h-full bg-surface-card
          transform transition-transform duration-300 ease-out
          lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Filter options"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-700">
            <h2 className="text-h4 font-semibold text-headline tracking-editorial uppercase">
              Filters
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-secondary-400 hover:text-brand-100 transition-colors"
              aria-label="Close filters"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Filter content */}
          <div className="flex-1 overflow-y-auto p-4">
            <form className="space-y-6">
              {filters.map((group) => (
                <fieldset key={group.field} className="space-y-3">
                  <legend className="text-small font-medium text-secondary uppercase tracking-editorial">
                    {group.label}
                  </legend>

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

          {/* Footer */}
          <div className="p-4 border-t border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 bg-surface-elevated border border-secondary-700 text-body text-brand-200 uppercase tracking-editorial hover:border-brand-400 hover:text-brand-100 transition-colors"
            >
              Show Results
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
