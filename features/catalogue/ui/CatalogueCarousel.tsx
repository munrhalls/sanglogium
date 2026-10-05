"use client";

import { Carousel } from "@/platform/design/ui/carousel/CarouselRoot";
import { CarouselTrack } from "@/platform/design/ui/carousel/CarouselTrack";
import { CarouselSlide } from "@/platform/design/ui/carousel/CarouselSlide";

import { CatalogueView } from "./CatalogueView";
import type { NavigationItem } from "@/features/catalogue/core/rules/catalogue";

import { cn } from "@/platform/utils/tailwind";

interface CatalogueCarouselProps {
  catalogueDataRaw: { catalogue: NavigationItem[] };
}

export default function CatalogueCarousel({ catalogueDataRaw }: CatalogueCarouselProps) {
  const catalogueData: NavigationItem[] = catalogueDataRaw.catalogue;

  return (
    <nav
      aria-label="Catalogue Navigation"
      className="flex h-full w-full flex-col"
    >
      <Carousel itemsCount={catalogueData.length}>
        <CarouselTrack className="touch-pan-x snap-x snap-mandatory overflow-x-auto landscape:h-full rounded-none">
          {catalogueData.map((item) => (
            <CarouselSlide
              key={item.id}
              className="group/animation-settle flex h-full min-w-full flex-1 snap-start snap-always flex-col"
            >
              <div
                className={cn(
                  "duration-450 h-full w-full flex-1 opacity-15 transition-all ease-in-out will-change-transform",
                  "flex flex-col group-data-[active=true]/animation-settle:opacity-100"
                )}
              >
                <CatalogueView data={item} />
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
