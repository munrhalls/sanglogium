import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Spotlight1Data } from "./getSpotlight1Data";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface ProductSpotlight1Props {
  spotlightData: Spotlight1Data | null;
}

export default async function ProductSpotlight1({ spotlightData }: ProductSpotlight1Props) {
    if (!spotlightData || !spotlightData.productRef) return null;
    const { productRef: product, promoTitle, promoSubtitle, promoText } = spotlightData;

    return (
        <article className="w-full relative overflow-hidden py-12 md:py-24 bg-surface-page">
            <div className="max-w-content mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 lg:gap-20 items-stretch md:max-h-[420px]">
                    <div className="order-2 md:order-1 w-full h-full min-h-[320px] bg-surface-productImage rounded-none flex items-center justify-center relative overflow-hidden border border-border-secondary">
                        <Carousel itemsCount={Math.min(product.images?.length || 1, 9)} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }} className="w-full h-full overflow-visible">
                            <CarouselTrack className="w-full h-full">
                                {product.images?.slice(0, 9).map((image, idx) => (
                                    <CarouselSlide
                                        key={`${product._id}-${idx}`}
                                        className="h-full w-full flex items-center justify-center pt-6 px-6 pb-16 lg:pt-10 lg:px-10 lg:pb-16 opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out data-[active=true]:opacity-100 data-[active=true]:scale-100"
                                    >
                                        <Image
                                            src={image?.asset?._id ?? ""}
                                            alt={product.name}
                                            width={800}
                                            height={800}
                                            priority={idx === 0}
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="max-w-full max-h-full w-auto h-auto object-contain mix-blend-multiply"
                                        />
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>

                            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none">
                                <CarouselPrevious
                                    iconStyle="chevron"
                                    variant="dark"
                                    className="pointer-events-auto max-lg:h-9 max-lg:w-9 max-lg:border-0 max-lg:rounded-none max-lg:bg-transparent max-lg:hover:bg-transparent"
                                />
                                <div className="lg:hidden pointer-events-auto">
                                    <CarouselDots truncate variant="dark" />
                                </div>
                                <div className="hidden lg:block pointer-events-auto">
                                    <CarouselDots truncate variant="dark" />
                                </div>
                                <CarouselNext
                                    iconStyle="chevron"
                                    variant="dark"
                                    className="pointer-events-auto max-lg:h-9 max-lg:w-9 max-lg:border-0 max-lg:rounded-none max-lg:bg-transparent max-lg:hover:bg-transparent"
                                />
                            </div>

                        </Carousel>
                    </div>

                    <div className="order-1 md:order-2 w-full h-full bg-surface-subtle rounded-none flex flex-col justify-center p-8 lg:p-12 relative overflow-hidden border border-border-secondary shadow-cardDark">
                        <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                            <div className="spotlight-whirl absolute inset-0 will-change-transform">
                                <div className="spotlight-orbit-1 absolute -top-[20%] -right-[20%] w-[140%] h-[140%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5 will-change-transform" />
                                <div className="spotlight-orbit-2 absolute top-[10%] -left-[10%] w-[80%] h-[80%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10 will-change-transform" />
                                <div className="spotlight-orbit-3 absolute bottom-[5%] right-[5%] w-[40%] h-[40%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-20 will-change-transform" />
                            </div>
                        </div>

                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 z-[5]"
                            style={{
                                background:
                                    "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.04) 100%)",
                            }}
                        />

                        <div className="flex flex-col relative z-10">
                            <span className="text-accent-500 uppercase text-sm tracking-widest mb-1 section-header-anchor">{product.brand.name}</span>
                            <div className="flex flex-col gap-2">
                                <h2 className="type-section-hed">{promoTitle || product.name}</h2>
                                <h3 className="text-h3 font-light text-text-subtitle">{promoSubtitle || product.name}</h3>
                            </div>
                            <p className="type-body text-text-body mt-4 max-w-prose text-pretty">
                                {promoText || "Unrivaled acoustic engineering and clarity."}
                            </p>
                        </div>
                        <div className="mt-8 flex justify-center relative z-10">
                            <Link href={`/product/${product.slug}`} className="border border-brand-200 text-brand-100 uppercase transition-colors duration-200 hover:bg-brand-800 hover:text-brand-50 cursor-pointer px-6 py-3">
                                See More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
