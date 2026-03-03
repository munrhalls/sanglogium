import { cn } from "@/lib/utils/tailwind";
import React from "react";
import type { CatalogueItem } from "./data";
import CatalogueHeader from "./header/CatalogueHeader";
import CatalogueSegments from "./segments/CatalogueSegments";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-full w-full flex-1 flex-col items-start justify-start bg-brand-700",
        "sm:h-full",
        "landscape:h-full landscape:flex-row"
      )}
    >
      <CatalogueHeader data={data} />
      <CatalogueSegments data={data} />
    </div>
  );
}
