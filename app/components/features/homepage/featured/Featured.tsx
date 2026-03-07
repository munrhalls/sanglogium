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
import FeaturedHeader from "./FeaturedHeader";
import FeaturedProduct from "./FeaturedProduct";

export default function Featured() {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-secondary-50 py-20">
      <div className="container mx-auto">
        <Carousel itemsCount={products.length}>
          <div className="flex items-end justify-between mb-10 md:mb-16">
            <FeaturedHeader />
          </div>

          <CarouselTrack className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
            {products.map((product) => (
              <CarouselSlide
                key={product._id}
                className={cn(
                  "min-w-0 flex-shrink-0 snap-start transition-all duration-500",
                  "basis-full 2xs:basis-1/2 sm:basis-1/3 md:landscape:basis-1/4 lg:basis-1/5",
                  "px-3"
                )}
              >
                <FeaturedProduct name={product.name} imageUrl={product.imageUrl} />
              </CarouselSlide>
            ))}
          </CarouselTrack>

          <div className="flex gap-4 pb-2 mt-8">
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
