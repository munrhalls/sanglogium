import React from 'react';

interface CheckboxProps {
  /** Visible label text for the option. */
  label: string;
  /** Optional trailing result count, pushed to the far right. */
  count?: number;
  /** Static demo only — uncontrolled, so clicking still toggles visually. */
  defaultChecked?: boolean;
  /** Zero-count, unselected options render dimmed and non-interactive. */
  disabled?: boolean;
}

/**
 * The only checkbox in the app. Lives outside the filters folder because it is a
 * generic ui primitive, but it exists for filters and carries the filter state
 * palette: gold when active, primary border when idle, gold focus ring.
 */
export function Checkbox({ label, count, defaultChecked, disabled }: CheckboxProps) {
  return (
    <label
      className={`group flex items-center gap-3 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border-primary bg-transparent text-transparent transition-colors group-hover:border-accent-500 peer-checked:border-accent-500 peer-checked:bg-accent-500 peer-checked:text-brand-700 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
        >
          <path d="M3.5 8.5l3 3 6-6" />
        </svg>
      </span>
      <span className="type-body text-text-secondary transition-colors group-hover:text-text-primary">
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto type-caption text-text-caption">{count}</span>
      )}
    </label>
  );
}
