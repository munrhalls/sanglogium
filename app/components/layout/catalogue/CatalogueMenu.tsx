import React from "react";
import type { CatalogueItem } from "./data";
import CatalogueHeader from "./CatalogueHeader";
import CatalogueSegments from "./CatalogueSegments";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div className="relative flex h-auto w-full flex-col items-start justify-start gap-8 bg-brand-700 pb-12">
      <CatalogueHeader data={data} />
      <CatalogueSegments data={data} />
    </div>
  );
}
