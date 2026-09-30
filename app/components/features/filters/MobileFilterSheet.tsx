'use client';

import React, { useState } from 'react';
import { Drawer } from 'vaul';
import { FunnelSimple as FunnelIcon, X as XIcon } from '@phosphor-icons/react';
import { FilterPanelBody } from './FilterSidebar';
import type { Category, FacetOptionCount } from '@/features/product-filtering';
import type { RangeBounds } from '@/sanity-cms/lib/products/getFilterFacets';
import { cn } from '@/lib/utils/tailwind';

/**
 * Mobile/tablet (<1024px, i.e. below the `lg-touch`/`lg-desktop` pair)
 * equivalent of FilterSidebar.tsx: below that width FilterSidebar renders
 * nothing (it's `hidden` until `lg-touch:flex`/`lg-desktop:flex`), so this
 * is currently the ONLY way to reach filters on a phone/tablet viewport.
 *
 * A trigger button (shown only below lg-touch) opens a `vaul` bottom sheet
 * containing the same FilterPanelBody used by the desktop sidebar, so
 * facet logic/URL params/counts stay identical between breakpoints -- only
 * the chrome around it differs. Own local `open` state rather than the
 * site-wide `useDrawer` (nuqs `?drawer=`) used by the header's nav
 * drawer: that hook is a single global slot for the main nav/menu, and
 * this needs page-scoped facet props (counts, bounds, category) that only
 * exist on the category page, not in the root layout that owns the nav
 * drawer.
 */
export interface MobileFilterSheetProps {
  checkboxCounts: Record<string, FacetOptionCount[]>;
  booleanCounts: Record<string, number>;
  brandLabels: Record<string, string>;
  priceBounds: { min: number; max: number };
  rangeBounds?: Record<string, RangeBounds>;
  category?: Category;
  isDefaultState?: boolean;
  /** Optional: render only these facet group ids (see FilterSidebar). */
  groupIds?: string[];
  /** Shown on the trigger button and the sheet's "show results" footer. */
  totalCount: number;
}

const PANEL_SCROLL_ID = 'filter-panel-scroll-mobile';
const GROUP_ID_PREFIX = 'filter-group-mobile-';

export function MobileFilterSheet(props: MobileFilterSheetProps) {
  const { totalCount, ...panelProps } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="mobile-filter-trigger"
        aria-label="Open filters"
        className={cn(
          'flex items-center gap-2 rounded-md border border-border-secondary bg-surface-elevated px-4 py-2.5',
          'type-caption text-text-primary',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
          'flex lg-touch:hidden lg-desktop:hidden',
        )}
      >
        <FunnelIcon className="h-4 w-4" aria-hidden="true" />
        Filters
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen} direction="bottom">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 flex flex-col outline-none relative',
              'max-h-[85dvh] rounded-t-lg border-t border-border-secondary bg-surface-elevated',
              'bottom-[var(--mobile-menu-h)]',
            )}
          >
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border-secondary" aria-hidden="true" />
            {/* Visually-hidden Drawer.Title: vaul/Radix requires one for a11y,
                but FilterPanelBody already renders its own visible "Filters"
                heading + Clear-all action right below -- a second visible
                title here would just duplicate it. */}
            <Drawer.Title className="sr-only">Filters</Drawer.Title>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              data-testid="mobile-filter-close"
              className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-text-caption hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
              <FilterPanelBody
                {...panelProps}
                panelScrollId={PANEL_SCROLL_ID}
                groupIdPrefix={GROUP_ID_PREFIX}
              />
            </div>

            <div className="shrink-0 border-t border-border-secondary p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                data-testid="mobile-filter-show-results"
                className="w-full rounded-md bg-accent-500 py-3 type-caption font-medium text-white"
              >
                Show {totalCount} {totalCount === 1 ? 'result' : 'results'}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
