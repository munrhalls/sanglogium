"use client";

import React, { useState } from "react";
import { Drawer } from "vaul";
import { FilterControls } from "./FilterSidebar";
import { MobileSortButton } from "./MobileSortButton";
import type { CatalogueFacets } from "@/sanity-cms/lib/products/getFilterFacets";
import type { PriceBounds } from "@/lib/catalogue/priceBounds";

/**
 * Mobile / tablet-portrait controls row shown in place of the desktop filter
 * sidebar (which is `hidden` below `lg-touch`/`lg-desktop`). A "Filters" button
 * opens a bottom-sheet drawer containing the exact same `FilterControls` stack
 * as the sidebar; the sort control sits beside it, reachable in one tap without
 * opening the drawer.
 *
 * Static visual layer only, same hard guarantee as V1: open/close is cosmetic
 * local state, the drawer has no "Show results" / apply button (it just
 * closes), nothing reads or writes the URL, and no products are filtered,
 * sorted or counted here.
 */

function FunnelIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4 text-text-accent"
    >
      <path
        d="M1.5 2.5h13l-5 6v5l-3 1.5v-6.5l-5-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MobileFilterBar({ facets, priceBounds, category }: { facets: CatalogueFacets; priceBounds: PriceBounds; category: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-testid="mobile-filter-bar"
      className="mb-6 flex items-center gap-3 lg-touch:hidden lg-desktop:hidden"
    >
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="type-body inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm border border-border-secondary bg-surface-elevated px-4 py-2 text-text-body transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <FunnelIcon />
            Filters
          </button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-lg border-t border-border-secondary bg-surface-elevated outline-none">
            <div className="relative flex items-center justify-between gap-2 px-6 pb-4 pt-5">
              <Drawer.Handle className="!absolute !left-1/2 !top-2 !-translate-x-1/2 !bg-border-secondary" />
              <Drawer.Title className="type-overline">Filters</Drawer.Title>
              <Drawer.Close asChild>
                <button
                  type="button"
                  aria-label="Close filters"
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
            <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-6 pb-8">
              <FilterControls facets={facets} priceBounds={priceBounds} category={category} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <MobileSortButton />
    </div>
  );
}
