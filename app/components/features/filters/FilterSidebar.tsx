"use client";

import React, { useState } from 'react';
import { Checkbox } from '@/app/components/ui/Checkbox';
import { PriceRangeSlider } from './PriceRangeSlider';

/**
 * Shared filter-section pattern.
 *
 * These are the section-header primitives every filter control shares — the
 * collapsible checkbox groups below and PriceRangeSlider. Controls import
 * these rather than restyling their own gold overline label, header row, or
 * active/inactive state colours.
 */
export const filterSectionHeaderRow = 'flex w-full items-center justify-between gap-2';
export const filterSectionHeaderLabel = 'type-overline transition-colors';
export const filterSectionHeaderAction = 'type-caption transition-colors';

/** Active = gold and interactive. Inactive = grey, dimmed, reads as "off". */
export const filterStateActive = 'text-text-accent';
export const filterStateInactive = 'text-text-caption opacity-50';

/**
 * Desktop filter sidebar shell — static visual surface only.
 *
 * All options, counts and price bounds are hardcoded placeholders. Local
 * useState here is cosmetic (collapse/expand, ticked look) so the static page
 * can be glance-checked. Nothing here reads or writes the URL, fetches data,
 * or touches the product grid.
 */

const BRAND_OPTIONS = [
  { value: 'sennheiser', label: 'Sennheiser', count: 24 },
  { value: 'audio-technica', label: 'Audio-Technica', count: 18 },
  { value: 'beyerdynamic', label: 'Beyerdynamic', count: 11 },
  { value: 'focal', label: 'Focal', count: 6 },
  { value: 'hifiman', label: 'HiFiMan', count: 0 },
];

const CONNECTIVITY_OPTIONS = [
  { value: 'wired', label: 'Wired', count: 41 },
  { value: 'wireless', label: 'Wireless', count: 27 },
  { value: 'bluetooth', label: 'Bluetooth', count: 19 },
];

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface CollapsibleFilterGroupProps {
  name: string;
  label: string;
  options: FilterOption[];
  defaultSelected?: string[];
}

function CollapsibleFilterGroup({ name, label, options, defaultSelected = [] }: CollapsibleFilterGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className={`${filterSectionHeaderRow} group/header`}
      >
        <span className={`${filterSectionHeaderLabel} group-hover/header:text-text-primary`}>
          {label}
        </span>
        <span
          aria-hidden="true"
          className={`${filterSectionHeaderAction} ${filterStateActive} group-hover/header:text-text-primary`}
        >
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              name={name}
              value={option.value}
              label={option.label}
              count={option.count}
              checked={selected.includes(option.value)}
              disabled={option.count === 0 && !selected.includes(option.value)}
              onChange={() => toggle(option.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InStockOnlyCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      name="in-stock"
      value="in-stock"
      label="In stock only"
      checked={checked}
      onChange={() => setChecked((current) => !current)}
    />
  );
}

export function FilterSidebar() {
  return (
    <aside
      data-testid="filter-sidebar"
      aria-label="Filters"
      className="hidden lg-touch:block lg-desktop:block w-64 shrink-0 self-start sticky top-0 pt-6 max-h-screen overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-6 rounded-md border border-border-secondary bg-surface-elevated p-6">
        <span className="type-overline">Filters</span>
        <PriceRangeSlider />
        <InStockOnlyCheckbox />
        <CollapsibleFilterGroup
          name="brand"
          label="Brand"
          options={BRAND_OPTIONS}
          defaultSelected={['sennheiser']}
        />
        <CollapsibleFilterGroup
          name="connectivity"
          label="Connectivity"
          options={CONNECTIVITY_OPTIONS}
        />
      </div>
    </aside>
  );
}
