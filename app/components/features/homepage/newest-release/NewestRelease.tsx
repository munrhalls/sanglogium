import React from "react";
import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import { sanityFetch } from "@/sanity/lib/client";

export default async function NewestRelease() {
  const data = await sanityFetch<any>({
    query: `*[_type == "homepage"][0].newestRelease{
      promoTitle,
      promoSubtitle,
      promoText,
      productRef->{
        _id,
        name,
        brand,
        displayPrice,
        image{asset->{url}},
        gallery[]{asset->{url}},
        overviewFields
      }
    }`
  });

  if (!data?.productRef) return null;

  const product = data.productRef;
  const images = [
    product.image?.asset?.url,
    ...(product.gallery?.map((g: any) => g.asset?.url) || [])
  ].filter(Boolean);

  const mappedSpotlight = {
    brand: product.brand,
    name: product.name,
    headline: data.promoTitle || product.name,
    subheadline: data.promoSubtitle || product.brand,
    description: data.promoText || product.overviewFields?.[0]?.information || ""
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
            <Carousel itemsCount={images.length}>
              <CarouselTrack className="h-full">
                {images.map((img, idx) => (
                  <CarouselSlide key={idx} className="h-full basis-full flex-shrink-0">
                    <SpotlightHero image={img} tier="standard" />
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

