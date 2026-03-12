import React from "react";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import featuredImg from './featured_transparent.png';
import spotlightImg from './product_spotlight_transparent.png';

// --- ATOM 1: THE FEATURED CARD ---
const FeaturedCard = ({ product }: { product: any }) => (
    <article className="group flex flex-col h-full gap-4 p-6 border border-secondary-800 rounded-lg bg-transparent transition-all duration-300 hover:border-secondary-600 hover:bg-secondary-900/10">
        <div className="aspect-square w-full bg-brand-800/50 bg-secondary-300 rounded-md overflow-hidden relative flex items-center justify-center p-8">
            <img
                src={featuredImg.src}
                alt={product.name}
                className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-110"
            />
        </div>
        <div className="flex flex-col gap-2">
            <span className="text-small tracking-editorial text-secondary-500 uppercase">{product.brand}</span>
            <h3 className="text-h4 text-brand-100 line-clamp-1 group-hover:text-accent-400 transition-colors">{product.name}</h3>
            <p className="text-small text-secondary-400 line-clamp-2 leading-relaxed">Unrivaled acoustic engineering and clarity.</p>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
            <div className="flex flex-col">
                <span className="text-[10px] tracking-widest text-secondary-500 uppercase">Price</span>
                <span className="text-h4 text-brand-100">${product.displayPrice}</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent-500 text-brand-900 rounded-sm transition-all duration-300 hover:bg-accent-400 active:scale-95">
                <span className="text-small font-bold uppercase">Add</span>
            </button>
        </div>
    </article>
);

// --- ATOM 2: THE SPOTLIGHT CONTENT ---
const SpotlightSection = ({ data }: { data: any }) => (
    <section className="w-full py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/fractal_ring.webp')] bg-no-repeat bg-right-bottom mix-blend-overlay opacity-20 pointer-events-none z-0" />
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="w-full flex justify-center lg:justify-start">
                    <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full" />
                        <img src={spotlightImg.src}
                        />
                    </div>
                </div>
                <div className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-small tracking-editorial text-accent-500 uppercase">{data.brand}</span>
                        <h2 className="text-h1 text-brand-100 uppercase">{data.headline}</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-h3 text-brand-400">{data.subheadline}</h3>
                        <p className="text-body text-secondary-400 max-w-prose text-pretty">
                            {data.description?.[0]?.children?.[0]?.text || "Refined excellence in every detail."}
                        </p>
                    </div>
                    <div className="mt-8 pt-4">
                        <button className="group flex items-center gap-4 text-h4 tracking-signature text-accent-500 uppercase transition-all">
                            <span className="border-b border-accent-500 pb-1 group-hover:border-accent-100">See More</span>
                            <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// --- ORCHESTRATOR ---
export default function RedesignFeaturedAndProductSpotlight({
    featuredData,
    spotlightData
}: {
    featuredData?: any[],
    spotlightData?: any
}) {
    // INTERNAL MOCK HARNESS (Self-Heals if Parent sends nothing)
    const finalFeatured = featuredData && featuredData.length > 0 ? featuredData : MOCK_FEATURED;
    const finalSpotlight = spotlightData && spotlightData.name ? spotlightData : MOCK_SPOTLIGHT;

    return (
        <div className="flex flex-col w-full bg-brand-700">
            <section className="w-full py-20">
                <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                    <Carousel itemsCount={finalFeatured.length} breakpointMap={{ lgDesktop: 3, mdPortrait: 2, mobilePortrait: 1 }}>
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
                                {finalFeatured.map((p) => (
                                    <CarouselSlide key={p._id} className="px-3">
                                        <FeaturedCard product={p} />
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>
                            <div className="flex justify-center mt-4"><CarouselDots color="brand-400" /></div>
                        </div>
                    </Carousel>
                </div>
            </section>
            <SpotlightSection data={finalSpotlight} />
        </div>
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

const MOCK_SPOTLIGHT = {
    brand: "Meze",
    name: "LIRIC II",
    headline: "The Modern Standard",
    subheadline: "Refined Closed-Back Excellence",
    mainImage: "https://cdn.sanity.io/images/2tdmkpky/production/548a9c2b395dff17024bad8d3c62d8f3f33bf849-1024x1024.jpg",
};