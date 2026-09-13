'use client';

import React from 'react';
import { FACET_GROUPS, facetsForGroup, type FacetDef, type FacetGroupId } from '../lib/facetConfig';
import { useClearAllFilters } from '../lib/useFilterParam';
import type { FacetOptionCount } from '../lib/filterProducts';
import { CheckboxGroup, BooleanToggle, RangeControl, PriceControl, RatingControl } from './FilterControls';

/**
 * Desktop filter sidebar shell — the two-region layout the acceptance tests
 * ask for: a narrow rail of tiles (one per should-be.md group) on the left,
 * the actual controls on the right. Rail tile and panel section for the same
 * group are literally the two cells of one CSS Grid row (`grid-cols-[3rem_1fr]`,
 * default `align-items: stretch`), so a tile automatically spans exactly its
 * group's content height with zero JS measurement — no ResizeObserver, no
 * height-sync effect, nothing that can race or jitter (the AI_LESSONS L04/L05
 * preference for a structural fix over a live-measured one applies here too,
 * even though this isn't the image-reveal mechanism).
 *
 * Rail + panel share the sidebar's own scroll container (the same
 * sticky + max-h-screen + overflow-y-auto pattern production's FilterSidebar
 * uses for independent-from-the-grid scrolling), so a tile click's
 * `scrollIntoView` moves both together — reads as "the panel scrolls to that
 * group" because the panel is what's wide enough to see move.
 *
 * Facet option counts / price bounds / brand labels arrive as props from page
 * composition (the RSC) — this component never fetches data or touches the
 * product grid. Every control reads/writes its own URL param via
 * useFilterParam; nothing here is optimistic about a fetch in flight.
 */

interface FilterSidebarProps {
  checkboxCounts: Record<string, FacetOptionCount[]>;
  booleanCounts: Record<string, number>;
  brandLabels: Record<string, string>;
  priceBounds: { min: number; max: number };
}

function scrollToGroup(groupId: FacetGroupId) {
  document.getElementById(`poc-group-${groupId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function RailTile({ id, label }: { id: FacetGroupId; label: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollToGroup(id)}
      aria-label={`Jump to ${label} filters`}
      data-testid={`poc-rail-tile-${id}`}
      className="flex items-center justify-center border-b border-r border-border-secondary bg-surface-elevated py-4 transition-colors last:border-b-0 hover:bg-accent-500/10 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent-500"
    >
      <span className="type-overline whitespace-nowrap text-text-caption [writing-mode:vertical-rl] rotate-180">
        {label}
      </span>
    </button>
  );
}

function PanelSection({
  id,
  label,
  note,
  children,
}: {
  id: FacetGroupId;
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`poc-group-${id}`}
      data-testid={`poc-panel-${id}`}
      className="flex scroll-mt-6 flex-col gap-6 border-b border-border-secondary p-6 last:border-b-0"
    >
      <div className="flex flex-col gap-1">
        <span className="type-overline">{label}</span>
        <p className="type-caption text-text-caption">{note}</p>
      </div>
      {children}
    </div>
  );
}

function renderFacet(
  facet: FacetDef,
  checkboxCounts: Record<string, FacetOptionCount[]>,
  booleanCounts: Record<string, number>,
  brandLabels: Record<string, string>,
) {
  if (facet.control === 'checkbox') {
    return (
      <CheckboxGroup
        key={facet.id}
        facet={facet}
        counts={checkboxCounts[facet.id] ?? []}
        brandLabels={facet.id === 'brand' ? brandLabels : undefined}
      />
    );
  }
  if (facet.control === 'boolean') {
    return <BooleanToggle key={facet.id} facet={facet} count={booleanCounts[facet.id]} />;
  }
  return <RangeControl key={facet.id} facet={facet} />;
}

export function FilterSidebar({ checkboxCounts, booleanCounts, brandLabels, priceBounds }: FilterSidebarProps) {
  const clearAll = useClearAllFilters();

  return (
    <aside
      data-testid="poc-filter-sidebar"
      aria-label="Filters"
      className="hidden w-96 shrink-0 self-start sticky top-0 pt-6 max-h-screen overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg-touch:block lg-desktop:block"
    >
      <div className="flex flex-col overflow-hidden rounded-md border border-border-secondary bg-surface-elevated">
        <div className="flex items-center justify-between gap-2 p-6 pb-4">
          <span className="type-overline">Filters</span>
          <button
            type="button"
            onClick={clearAll}
            className="type-caption text-text-caption underline-offset-2 transition-colors hover:text-text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-[3rem_1fr]">
          {FACET_GROUPS.map((group) => (
            <React.Fragment key={group.id}>
              <RailTile id={group.id} label={group.label} />
              <PanelSection id={group.id} label={group.label} note={group.note}>
                {group.id === 'commercial' && <PriceControl min={priceBounds.min} max={priceBounds.max} />}
                {group.id === 'commercial' && <RatingControl />}
                {group.id === 'wireless' && (
                  <p className="type-caption text-text-caption">
                    These apply to wireless headphones — a wired-only pick simply won&rsquo;t match once one is set.
                  </p>
                )}
                {facetsForGroup(group.id).map((facet) => renderFacet(facet, checkboxCounts, booleanCounts, brandLabels))}
              </PanelSection>
            </React.Fragment>
          ))}
        </div>
      </div>
    </aside>
  );
}
