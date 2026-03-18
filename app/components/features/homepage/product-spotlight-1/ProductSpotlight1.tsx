import React from "react";
import spotlightImg from './product_spotlight_transparent.png';
import { ProductSpotlight1Props } from "./types";

export default function ProductSpotlight1({ spotlightData }: ProductSpotlight1Props) {
    const finalSpotlight = spotlightData && spotlightData.name ? spotlightData : MOCK_SPOTLIGHT;

    return (
        <section className="w-full py-20 relative overflow-hidden border-t border-secondary-800 bg-brand-700">
            <div className="absolute inset-0 bg-[url('/fractal_ring.webp')] bg-no-repeat bg-right-bottom mix-blend-overlay opacity-20 pointer-events-none z-0" />
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">

                    {/* LEFT PANEL */}
                    {/* CRITICAL: Enforced rounded-none on the left structural block */}
                    <div className="w-full h-full bg-brand-300 rounded-none flex items-center justify-center relative p-8 lg:p-12 overflow-hidden">
                        <img
                            src={spotlightImg.src}
                            alt={finalSpotlight.name || "Product Spotlight"}
                            className="w-auto h-auto max-w-[85%] max-h-[85%] object-contain mix-blend-multiply relative z-10"
                        />
                    </div>

                    {/* RIGHT PANEL */}
                    {/* CRITICAL: Enforced rounded-none on the right structural block */}
                    <div className="w-full h-full bg-brand-800 rounded-none flex flex-col justify-center gap-6 p-8 lg:p-12">
                        <div className="flex flex-col gap-2">
                            <span className="text-small tracking-editorial text-accent-500 uppercase">{finalSpotlight.brand}</span>
                            <h2 className="text-h1 uppercase">{finalSpotlight.headline}</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-h3">{finalSpotlight.subheadline}</h3>
                            <p className="text-body max-w-prose text-pretty">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sed quia vero fuga adipisci. Quis nostrum, explicabo porro voluptates vel esse fugiat! Ut dolores tenetur nihil commodi, veniam sequi aliquid.
                            </p>
                            <p className="text-body max-w-prose text-pretty">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sed quia vero fuga adipisci. Quis nostrum, explicabo porro voluptates vel esse fugiat! Ut dolores tenetur nihil commodi, veniam sequi aliquid.
                            </p>
                            <p className="text-body max-w-prose text-pretty">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab sed quia vero fuga adipisci.
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
        </section>
    );
}

// --- MOCK DATA ---
const MOCK_SPOTLIGHT = {
    brand: "Meze",
    name: "LIRIC II",
    headline: "The Modern Standard",
    subheadline: "Refined Closed-Back Excellence",
    mainImage: "https://cdn.sanity.io/images/2tdmkpky/production/548a9c2b395dff17024bad8d3c62d8f3f33bf849-1024x1024.jpg",
};
