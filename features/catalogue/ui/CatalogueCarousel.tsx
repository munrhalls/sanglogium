"use client";

import { Carousel } from "@/app/components/ui/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/ui/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/ui/carousel/CarouselSlide";

import { CatalogueView } from "./CatalogueView";
import { transformCatalogueJson } from "./catalogueNavUtils";
import type { CatalogueNavItem } from "./catalogueNavTypes";

import { cn } from "@/lib/utils/tailwind";

interface CatalogueCarouselProps {
  catalogueDataRaw: { catalogue: CatalogueNavItem[] };
}

export default function CatalogueCarousel({ catalogueDataRaw }: CatalogueCarouselProps) {
  const catalogueData: CatalogueNavItem[] = transformCatalogueJson(catalogueDataRaw);

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
