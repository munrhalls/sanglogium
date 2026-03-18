import React from "react";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import featuredImg from './featured_transparent.png';
import { FeaturedProps, FeaturedCardProps } from "./types";

// --- ATOM 1: THE FEATURED CARD ---
const FeaturedCard = ({ product }: FeaturedCardProps) => (
    <article className="group flex flex-col h-full gap-4 p-6 border border-secondary-800 rounded-none bg-transparent transition-all duration-300 hover:border-secondary-600 hover:bg-secondary-900/10">
        {/* CRITICAL: Enforced rounded-none on the image well */}
        <div className="aspect-square w-full bg-brand-300 rounded-none overflow-hidden relative flex items-center justify-center p-8">
            <img
                src={featuredImg.src}
                alt={product.name}
                className="w-auto h-auto max-w-[85%] max-h-[85%] object-contain mix-blend-multiply transform transition-transform duration-700 group-hover:scale-110"
            />
        </div>
        <div className="flex flex-col gap-2">
            <span className="text-small tracking-editorial text-accent-500 uppercase">{product.brand}</span>
            <h3 className="text-h4 line-clamp-1 group-hover:text-accent-400 transition-colors">{product.name}</h3>
            <p className="text-small line-clamp-2 leading-relaxed">Unrivaled acoustic engineering and clarity.</p>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
            <div className="flex flex-col justify-center">
                <span className="text-h4">${product.displayPrice}</span>
            </div>
            {/* CRITICAL: Enforced rounded-none on the action button */}
            <button className="btn-secondary flex items-center gap-2 px-4 py-2 active:scale-95">
                <span className="text-small font-bold uppercase">Add</span>
            </button>
        </div>
    </article>
);

export default function Featured({ featuredData }: FeaturedProps) {
    const finalFeatured = featuredData && featuredData.length > 0 ? featuredData : MOCK_FEATURED;

    return (
        <section className="w-full py-20 bg-brand-700">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                <Carousel itemsCount={finalFeatured.length} breakpointMap={{ lgDesktop: 3, mdPortrait: 2, mobilePortrait: 1 }}>
                    <div className="relative flex flex-col gap-8">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-2">
                                <span className="text-small tracking-editorial text-secondary-400 uppercase">Curated Excellence</span>
                                <h2 className="text-h2 uppercase">Featured</h2>
                            </div>
                            <div className="flex gap-3 pb-1">
                                <CarouselPrevious className="border-secondary-600 text-secondary-400 hover:text-accent-500 hover:border-accent-500 transition-all rounded-none" />
                                <CarouselNext className="border-secondary-600 text-secondary-400 hover:text-accent-500 hover:border-accent-500 transition-all rounded-none" />
                            </div>
                        </div>
                        <CarouselTrack className="-mx-3">
                            {finalFeatured.map((p, idx) => (
                                <CarouselSlide key={p._id || idx} className="px-3">
                                    <FeaturedCard product={p} />
                                </CarouselSlide>
                            ))}
                        </CarouselTrack>
                        <div className="flex justify-center mt-4"><CarouselDots color="brand-400" /></div>
                    </div>
                </Carousel>
            </div>
        </section>
    );
}

// --- MOCK DATA ---
const MOCK_FEATURED = Array(6).fill({
    _id: "mock",
    brand: "Bowers & Wilkins",
    displayPrice: 399,
    imageUrl: "https://cdn.sanity.io/images/2tdmkpky/production/42f23254360ef257b21f5dabf676fd5d99d9eae7-1200x1200.jpg",
    name: "B&W Pi8 Wireless",
});
