import React from "react";
import type { CatalogueItem } from "./data";
import CatalogueHeader from "./CatalogueHeader";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  const sections = data.sections;
  const slots = Array.from({ length: 5 });
  const activeSlots = sections.length === 2 ? [1, 3] : [0, 2, 4];

  const getSymmetryClass = (index: number) => {
    switch (index) {
      case 0:
        return "translate-x-16"; // Top: Tucked in
      case 1:
        return "translate-x-4"; // Mid-top: Pushed out slightly
      case 2:
        return "-translate-x-4"; // Center: Pushed furthest left
      case 3:
        return "translate-x-4"; // Mid-bottom: Pushed out slightly
      case 4:
        return "translate-x-16"; // Bottom: Tucked in
      default:
        return "";
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-brand-700">
      <div className="flex items-center gap-4 lg:gap-12">
        <div className="flex flex-col gap-6">
          {slots.map((_, i) => {
            const sectionIndex = activeSlots.indexOf(i);
            const section = sectionIndex !== -1 ? sections[sectionIndex] : null;
            const symmetryClass = getSymmetryClass(i);

            return (
              <div
                key={i}
                className={`flex h-20 w-64 items-center justify-end text-right transition-transform duration-500 ${symmetryClass}`}
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
