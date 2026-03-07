"use client";

import products from "./content-dump.json";
import {
  Carousel,
  CarouselTrack,
  CarouselSlide,
  CarouselNext,
  CarouselPrevious,
  useCarousel
} from "@/app/components/layout/carousel/Carousel";
import { cn } from "@/lib/utils/tailwind";

export default function Featured() {
  const VISIBLE_COUNT = 2;
  if (!products || products.length === 0) return null;

  const dotCount = products.length - (VISIBLE_COUNT - 1);

  return (
    <section className="bg-zinc-950 py-24 overflow-hidden border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <Carousel itemsCount={products.length}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-light text-white uppercase italic tracking-tighter">
                Featured <span className="text-amber-500 font-bold not-italic">Spotlight</span>
              </h2>
            </div>
            <div className="flex gap-2">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>

          <CarouselTrack className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {products.map((product) => (
              <CarouselSlide
                key={product._id}
                className="min-w-0 flex-shrink-0 basis-1/2 snap-start"
              >
                <div className="bg-zinc-900/30 border border-zinc-800/50 p-12 flex flex-col items-center justify-center h-96 group">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-48 object-contain mb-8 group-hover:scale-105 transition-transform duration-500"
                  />
                  <h3 className="text-white text-xl font-light">{product.name}</h3>
                </div>
              </CarouselSlide>
            ))}
          </CarouselTrack>

          <div className="mt-12">
             <CustomDots count={dotCount} />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

function CustomDots({ count }: { count: number }) {
  const context = useCarousel();
  if (!context) return null;
  const { activeIndex, goTo } = context;

  return (
    <div className="flex justify-center gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => goTo(i)}
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",
            activeIndex === i ? "bg-amber-500 w-8" : "bg-zinc-700"
          )}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}
