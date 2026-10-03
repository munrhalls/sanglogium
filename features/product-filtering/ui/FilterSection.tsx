"use client";

import React from "react";

/**
 * Shared filter-section header primitives. Defined here (the bottom of the
 * production filter component chain) so FilterControls.tsx can import them
 * without creating a circular dependency through FilterSidebar.tsx's re-export.
 */
export const filterSectionHeaderRow = 'flex w-full items-center justify-between gap-2';
export const filterSectionHeaderLabel = 'type-overline transition-colors';
export const filterSectionHeaderAction = 'type-caption transition-colors';
export const filterStateActive = 'text-text-accent';
export const filterStateInactive = 'text-text-caption opacity-50';

function ResetIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 8a5.5 5.5 0 1 0 1.7-3.97M2.5 2.5V5.5H5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ResetButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!active}
      onClick={onClick}
      className={`rounded-full flex h-6 w-6 items-center justify-center transition-colors ${
        active
          ? `${filterStateActive} hover:bg-accent-500/10`
          : `${filterStateInactive} cursor-not-allowed`
      }`}
    >
      <ResetIcon />
    </button>
  );
}

export function FilterSliderSection({
  label,
  active,
  resetLabel,
  onReset,
  children,
}: {
  label: string;
  active: boolean;
  resetLabel: string;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className={filterSectionHeaderRow}>
        <span className={filterSectionHeaderLabel}>{label}</span>
        <ResetButton active={active} label={resetLabel} onClick={onReset} />
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
