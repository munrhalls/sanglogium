"use client";

import products from "./content-dump.json";
import {
  Carousel,
  CarouselTrack,
  CarouselSlide,
  CarouselNext,
  CarouselPrevious,
  CarouselDots
} from "@/app/components/layout/carousel/Carousel";
import { cn } from "@/lib/utils/tailwind";

export default function Featured() {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-brand-700 py-16 md:py-24 overflow-hidden border-t border-brand-800">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Carousel itemsCount={products.length}>

          <div className="flex items-end justify-between mb-10 md:mb-16">
            <div className="flex flex-col gap-2">
              <span className="text-small uppercase tracking-[0.3em] text-brand-400 font-bold">
                Curated
              </span>
              <h2 className="text-display-2 font-light text-brand-100 uppercase italic leading-[1.1]">
                Featured <span className="text-brand-400 font-bold not-italic">Spotlight</span>
              </h2>
            </div>


          </div>

          <CarouselTrack className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
            {products.map((product) => (
              <CarouselSlide
                key={product._id}
                className={cn(
                  "min-w-0 flex-shrink-0 snap-start transition-all duration-500",
                  "basis-full",
                  "2xs:basis-1/2 landscape:basis-1/2",
                  "sm:basis-1/3",
                  "md:landscape:basis-1/4",
                  "lg-touch:basis-1/5 lg-desktop:basis-1/5",
                  "px-3"
                )}
              >
                <div className="bg-brand-800/20 border border-brand-600/10 p-8 flex flex-col items-center justify-center h-[400px] group hover:border-brand-400/30 transition-all duration-500">
                  <div className="relative flex-1 flex items-center justify-center w-full">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-48 object-contain mb-8 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <h3 className="text-h4 font-regular text-brand-100 text-center tracking-wide uppercase">
                    {product.name}
                  </h3>
                </div>
              </CarouselSlide>
            ))}
          </CarouselTrack>

            <div className="flex gap-4 pb-2">
              <CarouselPrevious className="border-brand-600/30 bg-brand-800/50 text-brand-400 hover:border-brand-400 transition-colors" />
              <CarouselNext className="border-brand-600/30 bg-brand-800/50 text-brand-400 hover:border-brand-400 transition-colors" />
            </div>
          <div className="mt-12 md:mt-16">
             <CarouselDots />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
