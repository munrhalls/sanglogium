"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { FunnelSimple as FunnelIcon, X as XIcon } from "@phosphor-icons/react";
import { FilterPanel } from "./FilterPanel";
import type { ControlModel } from "@/features/product-filtering/core/types/controlModel";
import type { Panel } from "@/features/product-filtering/core/types/panel";
import { cn } from "@/platform/utils/tailwind";

// The mobile and tablet host of the panel (below the lg-touch and lg-desktop pair, where the sidebar is hidden): a trigger button and a bottom sheet around the same FilterPanel.
// It owns its trigger and its open state; the host only places it. Each click writes the address as in the sidebar, so there is no "show results" button to press.

export function FilterSheet({ model, panel }: { model: ControlModel; panel: Panel }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open filters"
        className={cn(
          "flex items-center gap-2 rounded-md border border-border-secondary bg-surface-elevated px-4 py-2.5",
          "type-caption text-text-primary",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
          "flex lg-touch:hidden lg-desktop:hidden",
        )}
      >
        <FunnelIcon className="h-4 w-4" aria-hidden="true" />
        Filters
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen} direction="bottom">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Drawer.Content
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex flex-col outline-none relative",
              "max-h-[85dvh] rounded-t-lg border-t border-border-secondary bg-surface-elevated",
              "bottom-[var(--mobile-menu-h)]",
            )}
          >
            <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border-secondary" aria-hidden="true" />
            <Drawer.Title className="sr-only">Filters</Drawer.Title>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-text-caption hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
              <FilterPanel model={model} panel={panel} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
