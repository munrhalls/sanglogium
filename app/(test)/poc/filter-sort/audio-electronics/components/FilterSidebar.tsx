'use client';

import React from 'react';
import type { IconType } from 'react-icons';
import { FaTag, FaLayerGroup, FaVolumeHigh, FaCompactDisc, FaRecordVinyl, FaWifi, FaHouse } from 'react-icons/fa6';
import { FACET_GROUPS, facetsForGroup, visibleGroups, type FacetDef, type FacetGroupId } from '../lib/facetConfig';
import { useClearAllFilters } from '../lib/useFilterParam';
import type { FacetOptionCount } from '../lib/filterProducts';
import type { FilterSortState } from '../lib/filterSortParams';
import { CheckboxGroup, BooleanToggle, RangeControl, PriceControl, RatingControl } from './FilterControls';

/**
 * Desktop filter sidebar shell — same two-region layout (rail of tiles +
 * scrolling panel) as ../../headphones/components/FilterSidebar.tsx. The one
 * addition: `visibleGroups(state)` decides which domain groups even render,
 * so the rail/panel never show Amplification tiles while browsing turntables
 * or vice versa (should-be-audio-electronics.md's domain-gating requirement).
 *
 * Facet option counts / price bounds / brand labels / filter state arrive as
 * props from page composition (the RSC) — this component never fetches data
 * or touches the product grid.
 */

const GROUP_ICONS: Record<FacetGroupId, IconType> = {
  commercial: FaTag,
  type: FaLayerGroup,
  amplification: FaVolumeHigh,
  digital: FaCompactDisc,
  turntable: FaRecordVinyl,
  wireless: FaWifi,
  physical: FaHouse,
};

interface FilterSidebarProps {
  state: FilterSortState;
  checkboxCounts: Record<string, FacetOptionCount[]>;
  booleanCounts: Record<string, number>;
  brandLabels: Record<string, string>;
  priceBounds: { min: number; max: number };
}

const PANEL_SCROLL_ID = 'poc-filter-panel-scroll';

// Deliberately not `element.scrollIntoView()`: the target sits inside two
// nested scrollable ancestors (this panel, and the page-level `<main>` from
// audio-electronics/layout.tsx), and `scrollIntoView` walks up EVERY
// scrollable ancestor to satisfy visibility — which nudges the product
// grid's scroll position too. Scrolling the panel container directly, by
// exact pixel offset, touches only this one element and nothing above it.
function scrollToGroup(groupId: FacetGroupId) {
  const container = document.getElementById(PANEL_SCROLL_ID);
  const target = document.getElementById(`poc-group-${groupId}`);
  if (!container || !target) return;
  const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
  container.scrollBy({ top: offset - 16, behavior: 'smooth' });
}

function RailTile({ id, label }: { id: FacetGroupId; label: string }) {
  const Icon = GROUP_ICONS[id];
  return (
    <button
      type="button"
      onClick={() => scrollToGroup(id)}
      aria-label={`Jump to ${label} filters`}
      title={`Jump to ${label} filters`}
      data-testid={`poc-rail-tile-${id}`}
      className="flex items-center justify-center rounded-md py-3.5 transition-colors hover:bg-accent-500/10 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent-500"
    >
      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-text-caption" aria-hidden="true" />
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
      className="flex flex-col gap-6 border-b border-border-secondary p-6 last:border-b-0"
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

export function FilterSidebar({ state, checkboxCounts, booleanCounts, brandLabels, priceBounds }: FilterSidebarProps) {
  const clearAll = useClearAllFilters();
  const visible = new Set(visibleGroups(state));
  const groups = FACET_GROUPS.filter((g) => visible.has(g.id));

  return (
    <aside
      data-testid="poc-filter-sidebar"
      aria-label="Filters"
      className="hidden w-96 shrink-0 self-start sticky top-0 pt-6 max-h-screen lg-touch:flex lg-desktop:flex flex-col"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-secondary bg-surface-elevated">
        <div className="flex shrink-0 items-center justify-between gap-2 p-6 pb-4">
          <span className="type-overline">Filters</span>
          <button
            type="button"
            onClick={clearAll}
            className="type-caption text-text-caption underline-offset-2 transition-colors hover:text-text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            Clear all
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <nav
            aria-label="Jump to a filter section"
            className="flex w-14 shrink-0 flex-col gap-0.5 overflow-y-auto overscroll-y-contain border-r border-border-secondary p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.map((group) => (
              <RailTile key={group.id} id={group.id} label={group.label} />
            ))}
          </nav>

          <div
            id={PANEL_SCROLL_ID}
            className="flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.map((group) => (
              <PanelSection key={group.id} id={group.id} label={group.label} note={group.note}>
                {group.id === 'commercial' && <PriceControl min={priceBounds.min} max={priceBounds.max} />}
                {group.id === 'commercial' && <RatingControl />}
                {facetsForGroup(group.id).map((facet) => renderFacet(facet, checkboxCounts, booleanCounts, brandLabels))}
              </PanelSection>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
