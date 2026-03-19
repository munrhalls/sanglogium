import React from "react";
import { sanityFetch } from "@/sanity/lib/client";
import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import { CarouselNext, CarouselPrevious, CarouselDots } from '@/app/components/layout/carousel/CarouselControls';
import DacsHeader from "./DacsHeader";
import DacCard from "./DacCard";

import { getDacProducts } from "./getDacProducts";

export default async function DACs() {
  const products = await getDacProducts();

  if (!products.length) return null;

  return (
    <Carousel itemsCount={products.length}>
      <div className="flex justify-between items-end mb-10">
        <DacsHeader />
      </div>
      <CarouselTrack className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory">
        {products.map((item) => (
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
