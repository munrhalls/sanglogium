"use client";

import {
  CarouselSlide,
  CarouselTrack,
  Carousel,
} from "@/app/components/ui/carousel/Carousel";
// import {
//   CarouselPrevious,
//   CarouselNext,
// } from "@/app/components/ui/carousel/Carousel";
import { CatalogueMenu } from "@/app/components/layout/catalogue/CatalogueMenu";
import { CATALOGUE_DATA } from "@/app/components/layout/catalogue/data";

export default function MobileCatalogue() {
  return (
    <nav
      aria-label="Catalogue Navigation"
      className="flex h-full w-full flex-col"
    >
      <Carousel className="flex-1">
        {/* Navigation Overlay
            Now fully decoupled: These buttons communicate wirelessly with the Track
            via the Context Provider in <Carousel>.
        */}
        {/* <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-2">
          <CarouselPrevious className="pointer-events-auto" />
          <CarouselNext className="pointer-events-auto" />
        </div> */}
        <CarouselTrack className="min-h-full">
          {CATALOGUE_DATA.map((item, index) => (
            <CarouselSlide key={item.id} index={index}>
              <CatalogueMenu data={item} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
