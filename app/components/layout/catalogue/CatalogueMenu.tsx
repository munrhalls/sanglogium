import React from "react";
import type { CatalogueItem } from "./data";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div className="container mx-auto h-full px-8 py-12">
      <div className="grid h-full grid-cols-12 gap-8">
        {/* Left: Categories Grid */}
        <div className="col-span-8 grid grid-cols-3 gap-8">
          {data.sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-brand-900 text-sm font-semibold uppercase tracking-widest">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-base text-gray-600 transition-colors hover:text-accent-500"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right: Feature Area */}
        <div className="col-span-4 flex h-full flex-col justify-between rounded-lg bg-gray-50 p-8">
          <div className="aspect-square w-full rounded-md border border-dashed border-gray-300 bg-white p-4 text-center text-xs text-gray-400">
            {/* Image Placeholder */}
            {data.feature.description}
          </div>
          <div className="mt-4">
            <p className="font-serif text-lg italic text-brand-800">
              {data.feature.caption}
            </p>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-500">
              Featured Collection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
