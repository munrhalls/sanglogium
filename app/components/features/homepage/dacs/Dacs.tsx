import React from "react";
import Link from "next/link";
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
        <div className="mx-auto max-w-content px-6 py-16 lg:px-8">
          <Carousel
            itemsCount={dacsData.length}
            breakpointMap={dacsBreakpointMap}
          >
            <div className="flex flex-col gap-4 md:gap-6">
              <DacsHeader />
              <Link
                href="/products/audio-electronics/digital-sources"
                className="inline-flex items-center gap-1 self-start py-3.5 px-3 -ml-3 type-caption text-brand-400 transition-colors hover:text-brand-100 md:py-0 md:px-0 md:ml-0"
              >
                View All <span aria-hidden="true">&rsaquo;</span>
              </Link>

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

                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
                  <CarouselPrevious
                    iconStyle="chevron"
                    variant="dark"
                    className="pointer-events-auto bg-brand-100/90 hover:bg-brand-200/90"
                  />
                  <CarouselNext
                    iconStyle="chevron"
                    variant="dark"
                    className="pointer-events-auto bg-brand-100/90 hover:bg-brand-200/90"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-3">
                <CarouselDots truncate />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
