'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { FaTag, FaHeadphones, FaWaveSquare, FaLayerGroup, FaBluetooth, FaMicrochip } from 'react-icons/fa6';
import { getFacetModule, resolveGroupIcon, type Category, type AnyFacetDef, type FacetOptionCount } from './facetRegistry';
import type { RangeBounds } from '@/sanity-cms/lib/products/getFilterFacets';
import { CheckboxGroup, BooleanToggle, RangeControl, PriceControl, RatingControl } from './FilterControls';

// Re-export the shared header/style constants so sibling filter modules can
// import them from a stable barrel instead of the component they decorate.
export {
  filterSectionHeaderRow,
  filterSectionHeaderLabel,
  filterSectionHeaderAction,
  filterStateActive,
  filterStateInactive,
} from './FilterControls';

/**
 * Desktop filter sidebar shell — the two-region layout the acceptance tests
 * ask for: a compact rail of tiles (one per should-be.md group) on the left,
 * the actual controls on the right. The rail is intentionally NOT height-
 * matched to the panel: it's a short, fixed-width table of contents that
 * always fits the sidebar's own visible height, while the panel underneath it
 * scrolls independently (its own `overflow-y-auto`) — that's what keeps a
 * 6-tile rail short even when a group's controls run long. A tile click
 * scrolls that panel container directly (see `scrollToGroup`) rather than
 * calling `scrollIntoView`, and both the rail and the panel set
 * `overscroll-y-contain` — together that's what keeps this sidebar's
 * scrolling fully sealed off from the product grid's own page-level scroll.
 *
 * Facet option counts / price bounds / brand labels arrive as props from page
 * composition (the RSC) — this component never fetches data or touches the
 * product grid. Every control reads/writes its own URL param via
 * useFilterParam; nothing here is optimistic about a fetch in flight.
 *
 * Category-aware since sang-logium-3rv.6: `category` picks which of the three
 * per-category facet modules (facetRegistry.ts) drives groups/facets/URL
 * params. Bespoke rail icons only exist for headphones today -- the other two
 * categories get a neutral fallback icon per group (resolveGroupIcon), a
 * content decision tracked separately, not a wiring gap.
 */

const HEADPHONES_GROUP_ICONS: Record<string, IconType> = {
  commercial: FaTag,
  type: FaHeadphones,
  sound: FaWaveSquare,
  material: FaLayerGroup,
  wireless: FaBluetooth,
  technical: FaMicrochip,
};
const FALLBACK_GROUP_ICON: IconType = FaLayerGroup;

interface FilterSidebarProps {
  checkboxCounts: Record<string, FacetOptionCount[]>;
  booleanCounts: Record<string, number>;
  brandLabels: Record<string, string>;
  priceBounds: { min: number; max: number };
  /** Optional: app/(store)/products/page.tsx (all-products) does not compute
   *  per-category range bounds and omits this prop entirely -- RangeControl
   *  falls back to facetConfig.ts's hardcoded min/max in that case, same as
   *  before sang-logium-3rv.5. */
  rangeBounds?: Record<string, RangeBounds>;
  /** Optional: app/(store)/products/page.tsx (all-products) spans every
   *  category and has no single facet module to pick -- defaults to
   *  headphones', unchanged from pre-sang-logium-3rv.6 behavior there. */
  category?: Category;
}

const PANEL_SCROLL_ID = 'poc-filter-panel-scroll';

// Deliberately not `element.scrollIntoView()`: the target sits inside two
// nested scrollable ancestors (this panel, and the page-level `<main>` from
// headphones/layout.tsx), and `scrollIntoView` walks up EVERY scrollable
// ancestor to satisfy visibility — which nudges the product grid's scroll
// position too. Scrolling the panel container directly, by exact pixel
// offset, touches only this one element and nothing above it.
function scrollToGroup(groupId: string) {
  const container = document.getElementById(PANEL_SCROLL_ID);
  const target = document.getElementById(`poc-group-${groupId}`);
  if (!container || !target) return;
  const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
  container.scrollBy({ top: offset - 16, behavior: 'smooth' });
}

function RailTile({ id, label, icon: Icon }: { id: string; label: string; icon: IconType }) {
  const title = label || id;
  return (
    <button
      type="button"
      onClick={() => scrollToGroup(id)}
      aria-label={`Jump to ${title} filters`}
      title={`Jump to ${title} filters`}
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
  id: string;
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`poc-group-${id}`}
      data-testid={`poc-panel-${id}`}
      className="flex flex-col gap-6 border-b border-border-secondary p-6 last:border-b-0"
    >
      {(label || note) && (
        <div className="flex flex-col gap-1">
          {label && <span className="type-overline">{label}</span>}
          {note && <p className="type-caption text-text-caption">{note}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function renderFacet(
  facet: AnyFacetDef,
  category: Category,
  checkboxCounts: Record<string, FacetOptionCount[]>,
  booleanCounts: Record<string, number>,
  brandLabels: Record<string, string>,
  rangeBounds: Record<string, RangeBounds>,
) {
  let control: React.ReactNode;
  if (facet.control === 'checkbox') {
    control = (
      <CheckboxGroup
        category={category}
        facet={facet}
        counts={checkboxCounts[facet.id] ?? []}
        brandLabels={facet.id === 'brand' ? brandLabels : undefined}
      />
    );
  } else if (facet.control === 'boolean') {
    control = <BooleanToggle category={category} facet={facet} count={booleanCounts[facet.id]} />;
  } else {
    control = <RangeControl category={category} facet={facet} bounds={rangeBounds[facet.id]} />;
  }

  if (!facet.subheading) {
    return <React.Fragment key={facet.id}>{control}</React.Fragment>;
  }

  return (
    <div key={facet.id} className="flex flex-col gap-3">
      <span className="type-overline">{facet.subheading}</span>
      {control}
    </div>
  );
}

export function FilterSidebar({
  checkboxCounts,
  booleanCounts,
  brandLabels,
  priceBounds,
  rangeBounds = {},
  category = 'headphones',
}: FilterSidebarProps) {
  const { FACET_GROUPS, facetsForGroup, useClearAllFilters } = getFacetModule(category);
  const clearAll = useClearAllFilters();
  const pathname = usePathname();
  const hideCustomerRating = pathname === '/products/headphones';

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
            {FACET_GROUPS.map((group) => (
              <RailTile
                key={group.id}
                id={group.id}
                label={group.label}
                icon={resolveGroupIcon(category, group.id, HEADPHONES_GROUP_ICONS, FALLBACK_GROUP_ICON)}
              />
            ))}
          </nav>

          <div
            id={PANEL_SCROLL_ID}
            className="flex-1 overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-6"
          >
            {FACET_GROUPS.map((group) => (
              <PanelSection key={group.id} id={group.id} label={group.label} note={group.note}>
                {group.id === 'commercial' && <PriceControl category={category} min={priceBounds.min} max={priceBounds.max} />}
                {group.id === 'commercial' && !hideCustomerRating && <RatingControl category={category} />}
                {facetsForGroup(group.id).map((facet) => renderFacet(facet, category, checkboxCounts, booleanCounts, brandLabels, rangeBounds))}
              </PanelSection>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
