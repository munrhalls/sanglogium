"use client";
import products from "./content-dump.json";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import FeaturedHeader from "./FeaturedHeader";
import FeaturedViewport from "./FeaturedViewport";
import FeaturedControls from "./FeaturedControls";

export default function Featured() {
  if (!products || products.length === 0) return null;
  return (
    <section className="py-20 px-8 bg-secondary-200 w-full">
      <Carousel itemsCount={products.length}>
        <div className="mx-auto">
          <FeaturedHeader />
          <FeaturedViewport products={products} />
          <FeaturedControls />
        </div>
      </Carousel>
    </section>
  );
}
