import React from "react";
import type { CatalogueItem } from "./data";
import CatalogueHeader from "./CatalogueHeader";
import CatalogueSegments from "./CatalogueSegments";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div className="relative flex h-full w-full items-start justify-center overflow-hidden bg-brand-700 p-2">
      {/* <CatalogueGrid /> */}
      {/* <div className="flex h-full flex-1 flex-col justify-center">
          {slots.map((_, i) => {
            const sectionIndex = activeSlots.indexOf(i);
            const section = sectionIndex !== -1 ? sections[sectionIndex] : null;
            const symmetryClass = SYMMETRY_STEPS[i] || "";

            return (
              <CatalogueSlot
                key={i}
                data={section}
                index={i}
                symmetryClass={symmetryClass}
              />
            );
          })}
        </div> */}
      <CatalogueHeader data={data} />
      <CatalogueSegments data={data} />
    </div>
  );
}
