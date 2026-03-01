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
    <div className="relative flex h-auto w-full flex-1 flex-col items-start justify-start gap-8 bg-brand-700 pb-12 landscape:h-full landscape:pb-0 landscape:flex-row">
      <CatalogueHeader data={data} index={index} />
      <CatalogueSegments data={data} index={index} />
    </div>
  );
}
