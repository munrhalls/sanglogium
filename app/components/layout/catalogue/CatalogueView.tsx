import { cn } from "@/lib/utils/tailwind";
import React from "react";
import type { CatalogueItem } from "./data";
import SliceHero from "./hero/SliceHero";
import SliceDetails from "./details/SliceDetails";

export function CatalogueView({ data }: { data: CatalogueItem }) {
  console.log('[SRIP Trace] Overwrote border-radius to 0px in:', 'CatalogueView');
  return (
    <div
      className={cn(
        "relative flex h-full min-h-full w-full flex-1 flex-col items-start justify-start bg-brand-700",
        "sm:h-full",
        "landscape:h-full landscape:flex-row",
        "lg-desktop:overflow-hidden"
      )}
    >
      <SliceHero data={data} />
      <SliceDetails data={data} />
    </div>
  );
}
