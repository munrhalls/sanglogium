"use client";

import {
  CarouselSlide,
  CarouselTrack,
  Carousel,
} from "@/app/components/ui/carousel/Carousel";

import { CatalogueMenu } from "@/app/components/layout/catalogue/CatalogueMenu";
import { CATALOGUE_DATA } from "@/app/components/layout/catalogue/data";
import { cn } from "@/lib/utils/tailwind";

export default function MobileCatalogue() {
  return (
    <nav
      aria-label="Catalogue Navigation"
      className="flex h-full w-full flex-col"
    >
      <Carousel itemsCount={CATALOGUE_DATA.length}>
        <CarouselTrack className="touch-pan-x snap-x snap-mandatory overflow-x-auto landscape:h-full">
          {CATALOGUE_DATA.map((item, index) => (
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
                <CatalogueMenu data={item} index={index} />
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
