"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { ArrowsDownUp, Check } from "@phosphor-icons/react/dist/ssr";
import { SORT_OPTIONS } from "@/lib/catalogue/filterSortParams";
import { useFilterParam } from "@/app/hooks/nuqs/useFilterSort";

/**
 * Mobile / tablet-portrait sort control — sibling of the "Filters" button in
 * `MobileFilterBar`. No "Sort by" text at this width: a single Phosphor sort
 * glyph (matching the funnel glyph on the Filters button, same size / accent
 * colour), differentiated only by the icon itself and the lighter, icon-first
 * treatment.
 *
 * Tap opens a vaul bottom-sheet listing the F1 sort options as a radio group
 * (the professional-ecommerce mobile pattern — never a clipped native select).
 * Choosing an option writes the `sort` param via F1's shared contract and the
 * sheet closes itself; there is no apply button. Nothing here touches the
 * product grid, data, counts or streaming.
 */
export function MobileSortButton() {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useFilterParam("sort");

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label="Sort"
          className="type-body inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm border border-border-secondary bg-surface-elevated px-4 py-2 text-text-body transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          <ArrowsDownUp aria-hidden="true" weight="regular" className="h-4 w-4 text-text-accent" />
          Sort
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-lg border-t border-border-secondary bg-surface-elevated outline-none">
          <div className="relative flex items-center justify-between gap-2 px-6 pb-4 pt-5">
            <Drawer.Handle className="!absolute !left-1/2 !top-2 !-translate-x-1/2 !bg-border-secondary" />
            <Drawer.Title className="type-overline">Sort by</Drawer.Title>
            <Drawer.Close asChild>
              <button
                type="button"
                aria-label="Close sort"
                className="flex h-11 w-11 items-center justify-center rounded-full text-text-accent transition-colors hover:bg-accent-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
                  <path
                    d="M3.5 3.5l9 9M12.5 3.5l-9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Drawer.Close>
          </div>
          <div
            role="radiogroup"
            aria-label="Sort by"
            className="flex min-h-0 flex-col overflow-y-auto pb-8"
          >
            {SORT_OPTIONS.map((option) => {
              const selected = option.value === sort;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setSort(option.value as typeof sort);
                    setOpen(false);
                  }}
                  className="type-body flex min-h-12 items-center justify-between gap-3 px-6 py-3 text-left text-text-body transition-colors hover:bg-accent-500/10"
                >
                  <span className={selected ? "text-text-accent" : undefined}>{option.label}</span>
                  {selected && (
                    <Check aria-hidden="true" weight="bold" className="h-4 w-4 shrink-0 text-text-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
