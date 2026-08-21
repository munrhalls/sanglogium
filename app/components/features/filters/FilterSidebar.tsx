import React from 'react';
import { Checkbox } from '@/app/components/ui/Checkbox';
import {
  FilterSectionHeader,
  filterControlState,
  PriceRangeSlider,
} from './PriceRangeSlider';
import { StockMinimumSlider } from './StockMinimumSlider';

/**
 * Collapsible group of filter options. Collapse/expand is native <details>, so
 * there is no client state and the sidebar stays a server component.
 */
export function CollapsibleFilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <details open className="group/filter-group">
      <summary className={`cursor-pointer list-none text-text-overline transition-colors hover:text-text-primary [&::-webkit-details-marker]:hidden ${filterControlState.focusRing}`}>
        <FilterSectionHeader
          label={label}
          trailing={
            <span aria-hidden className="type-overline leading-none">
              <span className="hidden group-open/filter-group:inline">&minus;</span>
              <span className="group-open/filter-group:hidden">+</span>
            </span>
          }
        />
      </summary>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </details>
  );
}

/**
 * Desktop filters sidebar shell.
 *
 * Tracer bullet 3: hardcoded sliders dropped in above the checkbox groups.
 * No URL reading, no client state, no data fetching.
 * Hidden entirely below 1024px — the mobile drawer is a separate actor/bullet.
 */
export function FilterSidebar() {
  return (
    <aside
      data-testid="filter-sidebar"
      aria-label="Filters"
      className="hidden lg-desktop:block lg-touch:block self-start sticky top-desktop-header-h max-h-[calc(100vh-var(--desktop-header-h))] overflow-y-auto scrollbar-none pt-6"
    >
      <div className="rounded-sm border border-border-secondary bg-surface-elevated p-6 space-y-6">
        <span className="type-overline block">Filters</span>

        <PriceRangeSlider />
        <StockMinimumSlider />

        <CollapsibleFilterGroup label="Brand">
          <Checkbox label="Sennheiser" count={48} defaultChecked />
          <Checkbox label="Audio-Technica" count={31} />
          <Checkbox label="Beyerdynamic" count={22} />
          <Checkbox label="Focal" count={9} />
          <Checkbox label="Grado" count={0} disabled />
        </CollapsibleFilterGroup>

        <CollapsibleFilterGroup label="Connectivity">
          <Checkbox label="Wired" count={64} />
          <Checkbox label="Wireless" count={37} />
          <Checkbox label="Bluetooth" count={29} />
        </CollapsibleFilterGroup>

        <CollapsibleFilterGroup label="Design">
          <Checkbox label="Over-ear" count={52} />
          <Checkbox label="On-ear" count={18} />
          <Checkbox label="In-ear" count={26} />
          <Checkbox label="Open-back" count={0} disabled />
        </CollapsibleFilterGroup>
      </div>
    </aside>
  );
}
