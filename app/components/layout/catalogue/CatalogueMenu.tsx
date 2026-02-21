import React from "react";
import type { CatalogueItem } from "./data";
import CatalogueHeader from "./CatalogueHeader";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  const sections = data.sections;
  const slots = Array.from({ length: 5 });
  const activeSlots = sections.length === 2 ? [1, 3] : [0, 2, 4];

  const SYMMETRY_STEPS = [
    "translate-x-4", // Top (Index 0)
    "translate-x-3", // Mid-top (Index 1)
    "translate-x-0", // Center (Index 2)
    "translate-x-3", // Mid-bottom (Index 3)
    "translate-x-4", // Bottom (Index 4)
  ] as const;

  return (
    <div className="flex h-full w-full items-start justify-center overflow-hidden bg-brand-700">
      <div className="flex h-full items-center lg:gap-12">
        <div className="flex h-full flex-1 flex-col">
          {slots.map((_, i) => {
            const sectionIndex = activeSlots.indexOf(i);
            const section = sectionIndex !== -1 ? sections[sectionIndex] : null;
            const symmetryClass = SYMMETRY_STEPS[i] || "";

            return (
              <div
                key={i}
                // ${symmetryClass}
                className={`flex h-20 w-fit items-center justify-start text-right transition-transform duration-500`}
              >
                {section && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-tighter text-brand-400">
                      {section.title}
                    </h3>
                    <ul className="hidden md:block">
                      {section.links.slice(0, 2).map((link) => (
                        <li key={link} className="text-xs text-secondary-300">
                          {link}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <CatalogueHeader data={data} />
      </div>
    </div>
  );
}
