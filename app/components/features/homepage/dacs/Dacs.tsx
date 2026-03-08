"use client";
import dacs from "./data.json";
import { Carousel, CarouselTrack, CarouselSlide, CarouselNext, CarouselPrevious, CarouselDots } from "@/app/components/layout/carousel/Carousel";
import DacsHeader from "./DacsHeader";
import DacCard from "./DacCard";

export default function DACs() {
  return (
    <Carousel itemsCount={dacs.length}>
      <div className="flex justify-between items-end mb-10">
        <DacsHeader />
      </div>
      <CarouselTrack className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory">
        {dacs.map((item) => (
          <CarouselSlide key={item._id} className="basis-full 2xs:basis-1/2 md:basis-1/3 lg:basis-1/3 flex-shrink-0 snap-start">
            <DacCard item={item} />
          </CarouselSlide>
        ))}
      </CarouselTrack>
      <div className="mt-12 flex items-center justify-between">
        <CarouselDots />
        <div className="flex gap-2">
          <CarouselPrevious className="static translate-y-0 h-10 w-10 border-brand-800/50 bg-brand-900/50" />
          <CarouselNext className="static translate-y-0 h-10 w-10 border-brand-800/50 bg-brand-900/50" />
        </div>
      </div>
    </Carousel>
  );
}
