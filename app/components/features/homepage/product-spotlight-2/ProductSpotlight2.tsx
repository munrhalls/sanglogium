import React from "react";
import Image from "next/image";
import { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface ProductSpotlight2Props {
  spotlightData: Spotlight1Data | null;
}

export default async function ProductSpotlight2({ spotlightData }: ProductSpotlight2Props) {
    if (!spotlightData || !spotlightData.productRef) return null;
    const { productRef: product, promoTitle, promoSubtitle, promoText } = spotlightData;

    return (
        <article className="w-full relative overflow-hidden border-t border-border-secondary py-24 bg-brand-700">
            <div className="max-w-content mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-20 items-stretch min-h-[400px] md:min-h-[500px]">
                    <div className="order-1 lg:order-2 w-full h-full bg-brand-300 rounded-none flex items-center justify-center relative overflow-hidden">
                        <Carousel itemsCount={product.images?.length || 1} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }} className="w-full h-full overflow-visible">
                            <CarouselTrack className="w-full h-full">
                                {product.images?.map((image, idx) => (
                                    <CarouselSlide key={`${product._id}-${idx}`} className="aspect-square w-full flex items-center justify-center pb-4 opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out data-[active=true]:opacity-100 data-[active=true]:scale-100">
                                        <Image
                                            src={image?.asset?._id ?? ""}
                                            alt={product.name}
                                            width={800}
                                            height={800}
                                            priority={idx === 0}
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="max-w-full max-h-[80%] w-auto h-auto object-contain mix-blend-multiply"
                                        />
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                                <div className="flex gap-2">
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </div>
                                <CarouselDots />
                            </div>
                        </Carousel>
                    </div>
                    <div className="order-2 lg:order-1 w-full h-full bg-brand-800 rounded-none flex flex-col justify-center p-8 lg:p-12 relative overflow-hidden">
                        <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
                            <div className="absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
                            <div className="absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-20" />
                        </div>
                        <div className="flex flex-col gap-2 relative z-10">
                            <span className="type-overline mb-1">{product.brand.name}</span>
                            <div className="flex flex-col gap-2">
                                <h2 className="type-section-hed">{promoTitle || product.name}</h2>
                                <h3 className="text-h3">{promoSubtitle || product.name}</h3>
                            </div>
                            <p className="type-body mt-6 max-w-prose text-pretty">
                                {promoText || "Unrivaled acoustic engineering and clarity."}
                            </p>
                        </div>
                        <div className="mt-10 flex justify-center relative z-10">
                            <button className="btn-secondary">
                                See More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
