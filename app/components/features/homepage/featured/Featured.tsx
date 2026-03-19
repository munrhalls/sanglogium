import React from "react";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import featuredImg from './featured_transparent.png';
import { getFeaturedProducts, FeaturedProduct } from "./getFeaturedProducts";

// --- ATOM 1: THE FEATURED CARD ---
interface FeaturedCardProps {
    product: FeaturedProduct;
}

const FeaturedCard = ({ product }: FeaturedCardProps) => (
    <article className="group flex flex-col h-full gap-4 p-6 border border-secondary-800 rounded-none bg-transparent transition-all duration-300 hover:border-secondary-600 hover:bg-secondary-900/10">
        <div className="aspect-square w-full bg-brand-300 rounded-none overflow-hidden relative flex items-center justify-center p-8">
            <img
                src={product.image?.asset?.url || featuredImg.src}
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
            <button className="btn-secondary flex items-center gap-2 px-4 py-2 active:scale-95">
                <span className="text-small font-bold uppercase">Add</span>
            </button>
        </div>
    </article>
);

export default async function Featured() {
    const finalFeatured = await getFeaturedProducts();

    if (!finalFeatured || finalFeatured?.length === 0) return null;

    return (
        <article className="w-full px-4 md:px-8">
            <Carousel itemsCount={finalFeatured?.length || 0} breakpointMap={{ lgDesktop: 3, mdPortrait: 2, mobilePortrait: 1 }}>
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
        </article>
    );
}
