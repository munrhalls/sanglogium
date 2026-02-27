"use client";

import {
  CarouselSlide,
  CarouselTrack,
  Carousel,
} from "@/app/components/ui/carousel/Carousel";

import { CatalogueMenu } from "@/app/components/layout/catalogue/CatalogueMenu";
import { CATALOGUE_DATA } from "@/app/components/layout/catalogue/data";

export default function MobileCatalogue() {
  return (
    <nav
      aria-label="Catalogue Navigation"
      className="flex h-full w-full flex-col"
    >
      <Carousel className="flex-1" itemsCount={CATALOGUE_DATA.length}>
        <CarouselTrack className="min-h-full">
          {CATALOGUE_DATA.map((item, index) => (
            <CarouselSlide key={item.id}>
              <CatalogueMenu data={item} index={index} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
