import React from 'react';

/**
 * Shared filter-control state palette. Active controls read gold, idle controls
 * read gray and dim; focus is always a gold ring. Every filter control pulls
 * from this record so the sidebar never drifts into two competing looks.
 *
 * Housed here rather than in FilterSidebar.tsx because the sidebar imports the
 * sliders — keeping the shared pattern in the leaf file keeps the dependency
 * one-directional instead of circular.
 */
export const filterControlState = {
  focusRing:
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
  /** Track fill / handle: gold when a filter is applied, gray when it is not. */
  fill: { active: 'bg-accent-500', inactive: 'bg-secondary-500' },
  /** Track remainder behind the handle. */
  remainder: { active: 'bg-secondary-800', inactive: 'bg-secondary-700' },
} as const;

/**
 * Shared filter-section header: gold overline label on the left, an optional
 * control slot on the right. Used by the collapsible checkbox groups and by
 * every slider section, so the two never grow separate header rows.
 */
export function FilterSectionHeader({
  label,
  trailing,
}: {
  label: string;
  trailing?: React.ReactNode;
}) {
  return (
    <span className="flex w-full items-center justify-between gap-3">
      <span className="type-overline">{label}</span>
      {trailing}
    </span>
  );
}

/** Small circular undo button: gold and hoverable when active, dimmed when not. */
function FilterResetButton({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
        active
          ? 'text-accent-500 hover:text-accent-400'
          : 'text-text-caption opacity-50'
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M2.5 8a5.5 5.5 0 1 0 1.7-3.97" />
        <path d="M2 2.5V5.5H5" />
      </svg>
    </span>
  );
}

/**
 * The one slider row pattern: caption label left, current value right, then an
 * 8px fully-rounded track with a fill up to the handle. StockMinimumSlider
 * renders this exact component — the track and handle exist only here.
 */
export function FilterSliderRow({
  label,
  value,
  percent,
  active,
}: {
  label: string;
  /** Preformatted display value, e.g. "£249" or "3 in stock". */
  value: string;
  /** Handle position along the track, 0–100. */
  percent: number;
  active: boolean;
}) {
  const state = active ? 'active' : 'inactive';

  return (
    <div className={active ? undefined : 'opacity-60'}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="type-caption text-text-caption">{label}</span>
        <span className="type-caption text-text-caption">{value}</span>
      </div>
      <div
        role="slider"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-readonly
        className={`relative h-2 w-full rounded-full ${filterControlState.remainder[state]}`}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${filterControlState.fill[state]}`}
          style={{ width: `${percent}%` }}
        />
        <div
          className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${filterControlState.fill[state]}`}
          style={{ left: `calc(8px + (100% - 16px) * ${percent} / 100)` }}
        />
      </div>
    </div>
  );
}

/**
 * Section wrapper for slider groups: shared header with its reset button, then
 * the rows. Both slider files compose through this.
 */
export function FilterSliderSection({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FilterSectionHeader label={label} trailing={<FilterResetButton active={active} />} />
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </div>
  );
}

/**
 * Tracer bullet 3: price range, presentational only. Hardcoded values, no state,
 * no URL reading — the real range input arrives with the wiring bullet.
 */
export function PriceRangeSlider() {
  return (
    <FilterSliderSection label="Price" active>
      <FilterSliderRow label="Min" value="£120" percent={18} active />
      <FilterSliderRow label="Max" value="£1,450" percent={72} active />
    </FilterSliderSection>
  );
}
