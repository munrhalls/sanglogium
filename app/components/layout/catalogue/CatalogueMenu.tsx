import React from "react";
import type { CatalogueItem } from "./data";
import Image from "next/image";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div className="w-full bg-brand-700 p-6 sm:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="flex flex-col space-y-6 lg:col-span-4">
            <h1 className="text-display-1 text-white">{data.label}</h1>

            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-800">
              <Image
                src={data.imageUrl}
                alt={data.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4"
                priority
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {data.sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-400">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-base text-gray-300 transition-colors hover:text-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
