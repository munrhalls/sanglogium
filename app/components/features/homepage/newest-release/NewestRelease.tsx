import React from "react";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity/lib/image";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import { getNewestRelease } from "./getNewestRelease";

export default async function NewestRelease() {
  const data = await getNewestRelease();

  if (!data || !data.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle, promoText } = data;

  return (
    <article className="w-full relative overflow-hidden border-secondary-800 bg-brand-700">
      <div className="absolute inset-0 bg-[url('/fractal_ring.webp')] bg-no-repeat bg-right-bottom mix-blend-overlay opacity-20 pointer-events-none z-0" />
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="w-full h-full bg-brand-300 rounded-none flex items-center justify-center relative p-8 lg:p-12 overflow-hidden">
            <Carousel itemsCount={product.images?.length || 1} className="w-full h-full">
              <CarouselTrack className="w-full h-full">
                {product.images?.map((image, idx) => (
                  <CarouselSlide key={idx} className="w-full h-full flex items-center justify-center">
                    <Image
                      src={urlFor(image).url()}
                      alt={product.name}
                      width={800}
                      height={800}
                      priority={idx === 0}
                      loading={idx === 0 ? "eager" : "lazy"}
                      className="w-auto h-auto max-w-full max-h-full object-contain mix-blend-multiply relative z-10"
                    />
                  </CarouselSlide>
                ))}
              </CarouselTrack>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <CarouselDots color="brand-400" />
              </div>
            </Carousel>
          </div>
          <div className="w-full h-full bg-brand-800 rounded-none flex flex-col justify-center gap-6 p-8 lg:p-12">
            <div className="flex flex-col gap-2">
              <span className="text-small tracking-editorial text-accent-500 uppercase">{product.brand}</span>
              <h2 className="text-h1 uppercase">{promoTitle || product.name}</h2>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-h3">{promoSubtitle || product.name}</h3>
              <p className="text-body max-w-prose text-pretty">
                {promoText || "Unrivaled acoustic engineering and clarity."}
              </p>
            </div>
            <div className="mt-8 pt-4 flex justify-center">
              <button className="btn-ghost group flex items-center gap-4 text-h4 uppercase">
                <span>See More</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
