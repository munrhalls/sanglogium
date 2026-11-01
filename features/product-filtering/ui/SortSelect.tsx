"use client";

import { useId } from "react";
import type { SortOption } from "@/features/product-filtering/core/types/sortMenu";

// The sort menu as a select: the entries it is given, the one that is current, and a report of the choice. Nothing is drawn without entries. It writes nothing.

export function SortSelect({ options, value, onChange }: { options: SortOption[]; value: string; onChange: (id: string) => void }) {
  const selectId = useId();
  if (options.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="type-caption text-text-caption whitespace-nowrap">
        Sort by
      </label>
      <div className="relative">
        <select
          id={selectId}
          name="sort"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="type-body rounded-sm appearance-none border border-border-secondary bg-surface-elevated py-2 pl-3 pr-9 text-text-body transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-text-accent"
        >
          <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
