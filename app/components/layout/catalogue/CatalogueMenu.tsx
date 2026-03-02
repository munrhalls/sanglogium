import { cn } from "@/lib/utils/tailwind";
import React from "react";
import type { CatalogueItem } from "./data";
import CatalogueHeader from "./CatalogueHeader";
import CatalogueSegments from "./CatalogueSegments";

export function CatalogueMenu({
  data,
  index,
}: {
  data: CatalogueItem;
  index: number;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-1 flex-col items-start justify-start bg-brand-700",
        "h-auto sm:h-full",
        "landscape:h-full landscape:flex-row"
      )}
    >
      <CatalogueHeader data={data} index={index} />
      <CatalogueSegments data={data} index={index} />
    </div>
  );
}
