import React from "react";
import type { CatalogueItem } from "./data";
import Image from "next/image";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div className="w-full bg-brand-700 p-6 sm:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="flex flex-col items-center space-y-2 sm:space-y-6 lg:col-span-4">
            {/* TODO
            1. mobile header size -> about 24px */}
            <h1 className="text-display-2 text-brand-400">{data.label}</h1>

            <div className="relative aspect-square w-1/2 overflow-hidden rounded-lg sm:bg-brand-800 md:w-full">
              <Image
                src={data.imageUrl}
                alt={data.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain sm:p-4"
                priority
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-8 sm:grid-cols-2 sm:gap-8 md:grid lg:col-span-8 lg:grid-cols-3">
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
                        className="text-base text-secondary-300 transition-colors hover:text-white"
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
