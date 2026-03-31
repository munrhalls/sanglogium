"use client";

import React, { useEffect } from 'react';
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

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterGroup[];
}

export function MobileFilterDrawer({ isOpen, onClose, filters }: MobileFilterDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const drawer = document.querySelector('[data-testid="mobile-filter-drawer"]') as HTMLElement;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when drawer opens
    firstElement?.focus();
    drawer.addEventListener('keydown', handleTabKey);
    return () => drawer.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const handleToggleFilter = (field: string, value: string) => {
    const newUrl = toggleFilter(pathname, new URLSearchParams(searchParams.toString()), field, value);
    router.push(newUrl, { scroll: false });
  };

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
            <h2 className="type-overline">
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
                  <legend className="type-overline">
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
                          checked={isFilterActive(searchParams, group.field, option.value)}
                          onChange={() => handleToggleFilter(group.field, option.value)}
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

          {/* Sticky Footer */}
          <div className="sticky bottom-0 p-4 border-t border-secondary-700 bg-surface-card shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
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
