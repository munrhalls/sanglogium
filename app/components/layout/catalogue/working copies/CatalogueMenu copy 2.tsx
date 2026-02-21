import React from "react";
import type { CatalogueItem } from "../data";
import CatalogueHeader from "../CatalogueHeader";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div className="h-full w-full bg-brand-700 p-6 sm:p-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <CatalogueHeader data={data} />
        <div className="flex-col gap-4 lg:grid-cols-12">
          <div className="mx-auto w-fit">
            <div className="flex flex-col flex-nowrap justify-start gap-8 sm:grid-cols-2 sm:gap-8 md:grid lg:col-span-8 lg:grid-cols-3">
              {data.sections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-400">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="pl-2 text-base text-secondary-300 transition-colors hover:text-white"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
