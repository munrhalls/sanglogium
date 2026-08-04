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
  lgDesktop: 3,
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
    <article className="relative w-full overflow-hidden bg-brand-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="fractal-spin-far absolute inset-[-25%] will-change-transform">
          <div className="fractal-depth-far h-full w-full bg-fractal-ring bg-center bg-no-repeat bg-[length:70%] opacity-[0.04] will-change-transform" />
        </div>
        <div className="fractal-spin-L1 absolute -right-[10%] -top-[10%] h-[120%] w-[120%] will-change-transform">
          <div className="fractal-depth-L1 h-full w-full bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-5 will-change-transform" />
        </div>
        <div className="fractal-spin-L2 absolute -left-[5%] top-[5%] h-[60%] w-[60%] will-change-transform">
          <div className="fractal-depth-L2 h-full w-full bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10 will-change-transform" />
        </div>
        <div className="fractal-spin-L3 absolute bottom-[2.5%] right-[2.5%] h-[30%] w-[30%] will-change-transform">
          <div className="fractal-depth-L3 h-full w-full bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10 will-change-transform" />
        </div>
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content px-6 py-16 md:py-24 lg:py-12 lg-touch:py-12 lg:px-8">
          <Carousel
            itemsCount={dacsData.length}
            breakpointMap={dacsBreakpointMap}
          >
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="w-full lg:max-w-[1200px] lg:px-20 lg-touch:max-w-[1000px] lg-touch:px-14 lg:mx-auto flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
                <DacsHeader />
                <Link
                  href="/products/audio-electronics/digital-sources"
                  className="inline-flex items-center gap-1 self-end py-3.5 px-3 -ml-3 type-caption text-brand-400 transition-colors hover:text-brand-100 md:py-0 md:px-0 md:ml-0 md:mb-4 uppercase"
                >
                  View All <span aria-hidden="true">&rsaquo;</span>
                </Link>
              </div>

              <div className="relative lg:px-20 lg:max-w-[1200px] lg-touch:px-14 lg-touch:max-w-[1000px] lg:mx-auto">
                <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
                  {dacsData.map((item, idx) => (
                    <CarouselSlide
                      key={item._id}
                      className="flex flex-col px-3"
                    >
                      <DacCard item={item} idx={idx} />
                    </CarouselSlide>
                  ))}
                </CarouselTrack>

                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between lg:flex">
                  <CarouselPrevious
                    iconStyle="chevron"
                    size={48}
                    weight="bold"
                    className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9"
                  />
                  <CarouselNext
                    iconStyle="chevron"
                    size={48}
                    weight="bold"
                    className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <CarouselPrevious
                  iconStyle="chevron"
                  size={14}
                  weight="bold"
                  className="pointer-events-auto h-4 w-4 bg-transparent p-0 text-brand-400 hover:bg-transparent hover:text-brand-100 lg:hidden"
                />
                <CarouselDots truncate />
                <CarouselNext
                  iconStyle="chevron"
                  size={14}
                  weight="bold"
                  className="pointer-events-auto h-4 w-4 bg-transparent p-0 text-brand-400 hover:bg-transparent hover:text-brand-100 lg:hidden"
                />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
