import React from "react";
import type { CatalogueItem } from "./data";
import Image from "next/image";
import {
  CarouselPrevious,
  CarouselNext,
} from "@/app/components/ui/carousel/Carousel";

export function CatalogueMenu({ data }: { data: CatalogueItem }) {
  return (
    <div className="h-full w-full bg-brand-700 p-6 sm:p-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex-col gap-4 lg:grid-cols-12">
          <div className="space-y-2 sm:grid sm:grid-cols-1 sm:space-y-6 lg:col-span-4">
            {/* TODO
            1. mobile header size -> about 24px */}
            <div className="grid min-h-[clamp(5.04rem,6.72vw+3.36rem,9.52rem)] items-end justify-center text-center">
              <h1 className="line-clamp-2 text-display-2 text-brand-400">
                {data.label}
              </h1>
            </div>
            <div className="flex items-center justify-center">
              <CarouselPrevious className="shrink-1 pointer-events-auto grow-0 sm:hidden" />
              <div className="relative aspect-square w-7/12 shrink-0 overflow-hidden rounded-lg sm:bg-brand-800 md:w-full">
                <Image
                  src={data.imageUrl}
                  alt={data.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain px-2 sm:p-4"
                  priority
                />
              </div>
              <CarouselNext className="shrink-1 pointer-events-auto grow-0 sm:hidden" />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 sm:grid-cols-2 sm:gap-8 md:grid lg:col-span-8 lg:grid-cols-3">
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
