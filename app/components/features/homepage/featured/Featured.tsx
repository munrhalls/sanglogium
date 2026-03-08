"use client";
import products from "./content-dump.json";
import { Carousel } from "@/app/components/layout/carousel/Carousel";
import FeaturedHeader from "./FeaturedHeader";
import FeaturedStage from "./FeaturedStage";
import FeaturedPodium from "./FeaturedPodium";

export default function Featured() {
  if (!products || products.length === 0) return null;
  return (
    <section className="py-20 bg-brand-900">
      <Carousel itemsCount={products.length}>
        <div className="container mx-auto px-4">
          <FeaturedHeader />
          <FeaturedStage products={products} />
          <FeaturedPodium />
        </div>
      </Carousel>
    </section>
  );
}

