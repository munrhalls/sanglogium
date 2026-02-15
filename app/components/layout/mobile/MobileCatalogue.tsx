"use client";

import {
  Carousel,
  CarouselTrack,
  useCarousel,
} from "@/app/components/ui/carousel/Carousel";
import { CarouselBtn } from "@/app/components/ui/carouselBtn/CarouselBtn";
import { CatalogueMenu } from "@/app/components/layout/catalogue/CatalogueMenu";
import { CATALOGUE_DATA } from "@/app/components/layout/catalogue/data";

export default function MobileCatalogue() {
  return (
    <nav aria-label="Catalogue Navigation" className="w-full text-white">
      <Carousel>
        <MobileCarouselControls />

        <CarouselTrack>
          {CATALOGUE_DATA.map((item) => (
            <CatalogueMenu key={item.id} data={item} />
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}

function MobileCarouselControls() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <div className="flex justify-between px-2">
      <CarouselBtn
        direction="prev"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      />
      <CarouselBtn
        direction="next"
        onClick={scrollNext}
        disabled={!canScrollNext}
      />
    </div>
  );
}
