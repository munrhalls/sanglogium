import React from "react";
import { sanityFetch } from "@/sanity/lib/client";
import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import { CarouselNext, CarouselPrevious, CarouselDots } from '@/app/components/layout/carousel/CarouselControls';
import DacsHeader from "./DacsHeader";
import DacCard from "./DacCard";

import { getDacProducts } from "./getDacProducts";

const dacsBreakpointMap = {
  xl: 2,
  lgDesktop: 2,
  mdLandscape: 2,
  mdPortrait: 2,
  smLandscape: 2,
  smPortrait: 2,
  mobileLandscape: 1,
  mobilePortrait: 1
};

export default async function DACs() {
  const products = await getDacProducts();

  if (!products.length) return null;

  return (
    <article className="w-full relative overflow-hidden border-secondary-800 bg-brand-900">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content">
          <div className="relative overflow-hidden border-secondary-800">
      <Carousel
        itemsCount={products.length}
        breakpointMap={dacsBreakpointMap}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <div className="flex flex-col gap-4 md:col-start-1 md:row-start-1">
            <DacsHeader />
          </div>

          <CarouselTrack className="w-full relative mx-0 items-stretch md:-mx-3 md:col-span-full md:row-start-2">
            {products.map((item, idx) => (
              <CarouselSlide
                key={item._id}
                className="flex h-full flex-col px-3"
              >
                <DacCard item={item} idx={idx} />
              </CarouselSlide>
            ))}
          </CarouselTrack>

          <div className="flex items-center justify-center md:flex-row gap-4 md:gap-8 md:col-start-2 md:row-start-1 md:justify-self-end md:pr-16">
            <CarouselPrevious
              className="transition-colors border-none shadow-none h-4 w-4 hover:bg-transparent focus:ring-0 active:scale-110 text-brand-400"
            />
            <CarouselDots color="brand-400" />
            <CarouselNext
              className="transition-colors border-none shadow-none h-4 w-4 hover:bg-transparent focus:ring-0 active:scale-105 text-brand-400"
            />
          </div>
        </div>
      </Carousel>
          </div>
        </div>
      </div>
    </article>
  );
}
