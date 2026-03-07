"use client";

import { useState, useEffect } from "react";
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
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    // Syncing precisely with your Tailwind Config 'screens'
    const queries = [
      { count: 5, query: "(min-width: 1024px)" }, // Matches lg-touch/lg-desktop
      { count: 4, query: "(min-width: 768px) and (orientation: landscape)" },
      { count: 3, query: "(min-width: 640px)" }, // sm
      { count: 2, query: "(min-width: 450px) or (orientation: landscape)" }, // 2xs
    ];

    const handler = () => {
      const match = queries.find(q => window.matchMedia(q.query).matches);
      setVisibleCount(match ? match.count : 1);
    };

    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-brand-700 py-20 overflow-hidden border-t border-brand-800">
      <div className="max-w-7xl mx-auto px-6">
        <Carousel itemsCount={products.length}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-h2 font-light text-brand-100 uppercase italic">
                Featured <span className="text-accent-500 font-bold not-italic">Spotlight</span>
              </h2>
            </div>
            <div className="flex gap-4">
              <CarouselPrevious className="border-brand-600/30 bg-brand-800/50 text-brand-400" />
              <CarouselNext className="border-brand-600/30 bg-brand-800/50 text-brand-400" />
            </div>
          </div>

          <CarouselTrack className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
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
                <div className="bg-brand-800/40 border border-brand-600/20 p-8 flex flex-col items-center justify-center h-96 group hover:border-accent-500/50 transition-colors duration-500">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-48 object-contain mb-8 group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                  <h3 className="text-h3 font-regular text-brand-100 text-center">{product.name}</h3>
                </div>
              </CarouselSlide>
            ))}
          </CarouselTrack>

          <div className="mt-12">
             <CustomDots visibleCount={visibleCount} totalCount={products.length} />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

function CustomDots({ visibleCount, totalCount }: { visibleCount: number, totalCount: number }) {
  const context = useCarousel();
  if (!context) return null;
  const { activeIndex, goTo } = context;

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: totalCount }).map((_, i) => {
        const isAnchor = i === activeIndex;
        const isInView = i > activeIndex && i < activeIndex + visibleCount;

        return (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              isAnchor ? "bg-accent-500 w-12" :
              isInView ? "bg-accent-500/30 w-6" :
              "bg-brand-800 w-3 hover:bg-brand-600"
            )}
            aria-label={`Go to item ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
