"use client";

import { iconFor } from "./sectionIconMap";

// The rail: one icon button per heading. It draws and reports which heading was chosen; scrolling is not its business.

export type RailTile = { key: string; label: string; icon: string };

export function SectionRail({ tiles, onSelect }: { tiles: RailTile[]; onSelect: (key: string) => void }) {
  return (
    <nav
      aria-label="Jump to a filter section"
      className="flex w-14 shrink-0 flex-col gap-0.5 overflow-y-auto overscroll-y-contain border-r border-border-secondary p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {tiles.map((tile) => {
        const Icon = iconFor(tile.icon);
        return (
          <button
            key={tile.key}
            type="button"
            onClick={() => onSelect(tile.key)}
            aria-label={`Jump to ${tile.label}`}
            title={`Jump to ${tile.label}`}
            className="flex items-center justify-center rounded-md py-3.5 transition-colors hover:bg-accent-500/10 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent-500"
          >
            <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-text-caption" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
