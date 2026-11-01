"use client";

import { X as XIcon } from "@phosphor-icons/react";
import type { Chip } from "@/features/product-filtering/core/types/chips";

// The chips: what is selected, each a button that takes that selection out, and one button that takes them all out. Nothing is drawn when nothing is selected.
// It reports the choice; it writes nothing.

const name = (chip: Chip) => (chip.text === "" ? chip.label : `${chip.label}: ${chip.text}`);

export function SelectionChips({ chips, onRemove, onClear }: { chips: Chip[]; onRemove: (chip: Chip) => void; onClear: () => void }) {
  if (chips.length === 0) return null;
  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.id}>
          <button
            type="button"
            onClick={() => onRemove(chip)}
            aria-label={`Remove ${name(chip)}`}
            className="flex items-center gap-1.5 rounded-full border border-border-secondary bg-surface-elevated px-3 py-1.5 type-caption text-text-primary transition-colors hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <span>{name(chip)}</span>
            <XIcon className="h-3.5 w-3.5 text-text-caption" aria-hidden="true" />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={onClear}
          className="type-caption text-accent-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Clear all
        </button>
      </li>
    </ul>
  );
}
