"use client";

import { Carousel, CarouselTrack } from "@/app/components/ui/carousel/Carousel";
// import {
//   CarouselPrevious,
//   CarouselNext,
// } from "@/app/components/ui/carousel/Carousel";
import { CatalogueMenu } from "@/app/components/layout/catalogue/CatalogueMenu";
import { CATALOGUE_DATA } from "@/app/components/layout/catalogue/data";

export default function MobileCatalogue() {
  return (
    <nav aria-label="Catalogue Navigation" className="h-full w-full text-white">
      <Carousel>
        {/* Navigation Overlay
            Now fully decoupled: These buttons communicate wirelessly with the Track
            via the Context Provider in <Carousel>.
        */}
        {/* <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-2">
          <CarouselPrevious className="pointer-events-auto" />
          <CarouselNext className="pointer-events-auto" />
        </div> */}
        <CarouselTrack>
          {CATALOGUE_DATA.map((item) => (
            <CatalogueMenu key={item.id} data={item} />
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
