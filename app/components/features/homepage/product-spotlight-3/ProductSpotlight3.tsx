import React from "react";
import spotlightImg from '../product-spotlight-1/product_spotlight_transparent.png';
import { getSpotlight3Data } from "./getSpotlight3Data";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

export default async function ProductSpotlight3() {
  const data = await getSpotlight3Data();

  if (!data || !data.productRef) return null;
  const { productRef: product, promoTitle, promoSubtitle, promoText } = data;

  return (
    <article className="w-full relative overflow-hidden border-secondary-800 bg-brand-700">
      <div className="absolute inset-0 bg-[url('/fractal_ring.webp')] bg-no-repeat bg-right-bottom mix-blend-overlay opacity-20 pointer-events-none z-0" />
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="w-full h-full bg-brand-300 rounded-none flex items-center justify-center relative p-8 lg:p-12 overflow-hidden">
            <Carousel itemsCount={1} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }}>
              <CarouselTrack className="w-full h-full">
                <CarouselSlide className="w-full h-full flex items-center justify-center">
                  <img
                    src={product.image?.asset?.url || spotlightImg.src}
                    alt={product.name}
                    className="w-auto h-auto max-w-[85%] max-h-[85%] object-contain mix-blend-multiply relative z-10"
                  />
                </CarouselSlide>
              </CarouselTrack>
              <CarouselPrevious />
              <CarouselNext />
              <CarouselDots />
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
            <div className="mt-8 pt-4">
              <button className="btn-ghost group flex items-center gap-4 text-h4 uppercase">
                <span>See More</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
