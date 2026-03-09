"use client";
import products from "./content-dump.json";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import FeaturedHeader from "./FeaturedHeader";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import Card from "./card/Card";

export default function Featured() {
  if (!products || products.length === 0) return null;

  const uniqueProducts = Array.from(
    new Map(products.map((p) => [p._id, p])).values()
  );

  return (
    <section className="w-full bg-secondary-200 py-24 px-8">
      <FeaturedHeader />
      <Carousel itemsCount={uniqueProducts.length}>
        <CarouselTrack>
          {uniqueProducts.map((product) => (
            <CarouselSlide
              key={product._id}
              className="min-w-0 shrink-0 grow-0 basis-full px-4 md:basis-1/3"
            >
              <Card product={product} />
            </CarouselSlide>
          ))}
        </CarouselTrack>
        <div className="mt-12 flex flex-col gap-8">
          <CarouselDots color="brand-700" />
          <div className="flex justify-center gap-4">
            <CarouselPrevious iconColor="text-brand-400" bg="bg-brand-900" />
            <CarouselNext iconColor="text-brand-400" bg="bg-brand-900" />
          </div>
        </div>
      </Carousel>
    </section>
  );
}

