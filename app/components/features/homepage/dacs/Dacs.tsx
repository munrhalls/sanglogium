import React from "react";
import { sanityFetch } from "@/sanity-cms/lib/client";
import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import { CarouselNext, CarouselPrevious, CarouselDots } from '@/app/components/layout/carousel/CarouselControls';
import DacsHeader from "./DacsHeader";
import DacCard from "./DacCard";
import { DacProduct } from "./getDacProducts";

interface DacsProps {
  dacsData: DacProduct[];
}

const dacsBreakpointMap = {
  xl: 3,
  lgDesktop: 2,
  mdLandscape: 2,
  mdPortrait: 2,
  smLandscape: 2,
  smPortrait: 2,
  xsLandscape: 2,
  xsPortrait: 1,
  mobileLandscape: 1,
  mobilePortrait: 1
};

export default async function DACs({ dacsData }: DacsProps) {
  if (!dacsData.length) return null;

  return (
    <article className="w-full relative overflow-hidden bg-surface-page">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content py-16">
          <Carousel
            itemsCount={dacsData.length}
            breakpointMap={dacsBreakpointMap}
          >
            <div className="flex flex-col gap-6">
              <DacsHeader />

              <div className="relative">
                <CarouselTrack className="w-full mx-0 items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
                  {dacsData.map((item, idx) => (
                    <CarouselSlide
                      key={item._id}
                      className="flex h-full flex-col px-3"
                    >
                      <DacCard item={item} idx={idx} />
                    </CarouselSlide>
                  ))}
                </CarouselTrack>

                <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 md:-left-5">
                  <CarouselPrevious />
                </div>
                <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 md:-right-5">
                  <CarouselNext />
                </div>
              </div>

              <CarouselDots className="mt-2" />
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
