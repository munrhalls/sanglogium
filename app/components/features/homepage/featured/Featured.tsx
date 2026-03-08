"use client";
import products from "./content-dump.json";
import { Carousel, CarouselTrack, CarouselSlide, CarouselNext, CarouselPrevious, CarouselDots } from "@/app/components/layout/carousel/Carousel";
import FeaturedHeader from "./FeaturedHeader";
import FeaturedProduct from "./FeaturedProduct";

export default function Featured() {
  if (!products || products.length === 0) return null;
  return (
    <Carousel itemsCount={products.length}>
      <div className="flex items-end justify-between mb-12">
        <FeaturedHeader />
      </div>
      
      <CarouselTrack className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4">
        {products.map((product) => (
          <CarouselSlide 
            key={product._id} 
            className="basis-full 2xs:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 px-4 flex-shrink-0 snap-start"
          >
            <FeaturedProduct product={product} />
          </CarouselSlide>
        ))}
      </CarouselTrack>

      <div className="flex gap-4 mt-12">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
      <div className="mt-16">
        <CarouselDots />
      </div>
    </Carousel>
  );
}
