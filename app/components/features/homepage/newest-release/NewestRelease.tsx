import React from "react";
import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import { getNewestRelease } from "./getNewestRelease";

export default async function NewestRelease() {
  const data = await getNewestRelease();

  if (!data || !data.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle, promoText } = data;
  
  const allImages = [
    product.image,
    ...(product.gallery ?? [])
  ].filter(Boolean);

  const mappedSpotlight = {
    brand: product.brand,
    name: product.name,
    headline: promoTitle || product.name,
    subheadline: promoSubtitle || product.brand,
    description: promoText || ""
  };

  return (
    <section className="w-full bg-brand-950 py-24 px-4 sm:px-8">
      <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="order-2 lg:order-1">
          <SpotlightDetails
            data={mappedSpotlight as any}
            accentColor="text-brand-400"
          />
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative h-feature-media w-full overflow-hidden bg-brand-800 rounded-lg">
            <Carousel itemsCount={allImages.length}>
              <CarouselTrack className="h-full">
                {allImages.map((img, idx) => (
                  <CarouselSlide key={idx} className="h-full basis-full flex-shrink-0">
                    <SpotlightHero image={img.asset.url} tier="standard" />
                  </CarouselSlide>
                ))}
              </CarouselTrack>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <CarouselDots color="brand-400" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}

