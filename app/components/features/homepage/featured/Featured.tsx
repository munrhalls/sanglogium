"use client";
import products from "./content-dump.json";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import FeaturedHeader from "./FeaturedHeader";
import FeaturedControls from "./FeaturedControls";
import Card from "./card/Card";

export default function Featured() {
  if (!products || products.length === 0) return null;

  const uniqueProducts = Array.from(
    new Map(products.map((p) => [p._id, p])).values()
  );

  return (
    <section className="w-full bg-secondary-200 py-24">
      <div className="mx-auto max-w-[1440px] px-8 md:px-12">
        <FeaturedHeader />

        <Carousel itemsCount={uniqueProducts.length}>
          <CarouselTrack className="gap-8 pb-4">
            {uniqueProducts.map((product) => (
              <CarouselSlide
                key={product._id}
                className="min-w-0 shrink-0 grow-0 basis-full md:basis-[calc(33.333%-21.33px)]"
              >
                <Card product={product} />
              </CarouselSlide>
            ))}
          </CarouselTrack>

          <FeaturedControls />
        </Carousel>
      </div>
    </section>
  );
}
