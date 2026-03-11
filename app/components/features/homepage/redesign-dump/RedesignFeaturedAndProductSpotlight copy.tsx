import React from "react";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface Product {
    _id: string;
    name: string;
    brand: string;
    displayPrice: number;
    imageUrl?: string;
    mainImage?: string;
    headline?: string;
    subheadline?: string;
    description?: any[];
}

export default function RedesignFeaturedAndProductSpotlight({
    featuredData = [],
    spotlightData = {} as Product
}: {
    featuredData?: Product[],
    spotlightData?: Product
}) {
    return (
        <div className="flex flex-col w-full bg-brand-700">

            <section className="w-full py-20">
                <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                    <Carousel
                        itemsCount={featuredData.length}
                        breakpointMap={{ lgDesktop: 3, mdPortrait: 2, mobilePortrait: 1 }}
                    >
                        <div className="relative flex flex-col gap-8">

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-2">
                                    <span className="text-small tracking-editorial text-secondary-400 uppercase">Curated Excellence</span>
                                    <h2 className="text-h2 text-brand-100 uppercase">Featured</h2>
                                </div>
                                <div className="flex gap-3 pb-1">
                                    <CarouselPrevious className="border-secondary-600 text-secondary-400 hover:text-accent-500 hover:border-accent-500 transition-all" />
                                    <CarouselNext className="border-secondary-600 text-secondary-400 hover:text-accent-500 hover:border-accent-500 transition-all" />
                                </div>
                            </div>

                            <CarouselTrack className="-mx-3">
                                {featuredData.map((product) => (
                                    <CarouselSlide key={product._id} className="px-3">
                                        <article className="group flex flex-col h-full gap-4 p-6 border border-secondary-800 rounded-lg bg-transparent transition-all duration-300 hover:border-secondary-600 hover:bg-secondary-900/10">

                                            <div className="aspect-square w-full bg-brand-800/50 rounded-md overflow-hidden relative flex items-center justify-center p-8">
                                                <img
                                                    src={product.imageUrl || product.mainImage}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span className="text-small tracking-editorial text-secondary-500 uppercase">{product.brand}</span>
                                                <h3 className="text-h4 text-brand-100 line-clamp-1 group-hover:text-accent-400 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-small text-secondary-400 line-clamp-2 leading-relaxed">
                                                    Unrivaled acoustic engineering and clarity.
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] tracking-widest text-secondary-500 uppercase">Price</span>
                                                    <span className="text-h4 text-brand-100">${product.displayPrice}</span>
                                                </div>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-accent-500 text-brand-900 rounded-sm transition-all duration-300 hover:bg-accent-400 active:scale-95">
                                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.9-5h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L17.42 4l-3.87 7H7.64L4.27 4 2.42 5l3.38 7-.13.24L4.4 15.17l-.01.03c0 .11.09.2.2.2h12.4v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63z" /></svg>
                                                    <span className="text-small font-bold uppercase">Add</span>
                                                </button>
                                            </div>
                                        </article>
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>

                            <div className="flex justify-center mt-4">
                                <CarouselDots color="brand-400" />
                            </div>
                        </div>
                    </Carousel>
                </div>
            </section>

            <section className="w-full py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/fractal_ring.webp')] bg-no-repeat bg-right-bottom mix-blend-overlay opacity-20 pointer-events-none z-0"></div>

                <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        <div className="w-full flex justify-center lg:justify-start">
                            <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
                                <div className="absolute inset-0 bg-accent-500/10 blur-[120px] rounded-full"></div>
                                <img
                                    src={spotlightData.mainImage}
                                    alt={spotlightData.name}
                                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
                                />
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-small tracking-editorial text-accent-500 uppercase">{spotlightData.brand}</span>
                                <h2 className="text-h1 text-brand-100 uppercase">{spotlightData.headline}</h2>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h3 className="text-h3 text-brand-400">{spotlightData.subheadline}</h3>
                                <p className="text-body text-secondary-400 max-w-prose text-pretty">
                                    {spotlightData.description?.[0]?.children?.[0]?.text}
                                </p>
                            </div>

                            <div className="mt-8 pt-4">
                                <button className="group flex items-center gap-4 text-h4 tracking-signature text-accent-500 uppercase transition-all">
                                    <span className="border-b border-accent-500 pb-1 group-hover:border-accent-100 group-hover:text-accent-100 transition-all">
                                        See More
                                    </span>
                                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
}