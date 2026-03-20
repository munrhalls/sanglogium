import React from "react";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import featuredImg from './featured_transparent.png';
import { getFeaturedProducts, FeaturedProduct } from "./getFeaturedProducts";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";

// --- ATOM 1: THE FEATURED CARD ---
interface FeaturedCardProps {
    product: FeaturedProduct;
}

const FeaturedCard = ({ product }: FeaturedCardProps) => (
    <article className="group flex flex-col h-full gap-4 p-6 border border-secondary-800 rounded-none bg-transparent transition-all duration-300 hover:border-secondary-600 hover:bg-secondary-900/10">
        <div className="aspect-4/3 w-full bg-brand-300 rounded-none overflow-hidden relative flex items-center justify-center p-8">
            <img
                src={product.image?.asset?.url || featuredImg.src}
                alt={product.name}
                className="w-auto h-auto max-w-[85%] max-h-[85%] object-contain mix-blend-multiply transform transition-transform duration-700 group-hover:scale-110"
            />
        </div>
        <div className="flex-grow flex flex-col gap-2">
            <h3 className="text-body tracking-editorial text-accent-500 uppercase">{product.brand}</h3>
            <p className="text-small group-hover:text-accent-400 transition-colors">{product.name}</p>
            {/* <p className="text-small leading-relaxed flex-grow">{product.productPromo}</p> */}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-secondary-800">
            <div className="flex flex-col justify-center">
                <span className="text-h4">${product.displayPrice}</span>
            </div>
            <button className="btn-cart transition-all active:scale-95">
                <ShoppingCart size={20} weight="light" />
                <span className="text-small font-bold uppercase">Add</span>
            </button>
        </div>
    </article>
);

export default async function Featured() {
    const finalFeatured = await getFeaturedProducts();

    if (!finalFeatured || finalFeatured?.length === 0) return null;

    return (
        <article className="w-full px-4 md:px-8 bg-brand-950">
            <Carousel itemsCount={finalFeatured?.length || 0} breakpointMap={{ lgDesktop: 3, mdPortrait: 2, mobilePortrait: 1 }}>
                <div className="relative flex flex-col lg-touch:gap-6 lg-desktop:gap-6">
                    <div className=" flex flex-col gap-2">
                        <span className="text-small tracking-editorial text-secondary-400 uppercase">Curated Excellence</span>
                        <h2 className="text-h2 uppercase">Featured</h2>
                    </div>
                    <CarouselTrack className="mt-4 mx-0 md:-mx-3 items-stretch relative">
                        {finalFeatured.map((p, idx) => (
                            <CarouselSlide key={p._id || idx} className="px-3 h-full flex flex-col">
                                <FeaturedCard product={p} />
                            </CarouselSlide>
                        ))}
                    </CarouselTrack>
                    <div className="mt-4 flex flex-col md:flex-row items-center justify-center  md:gap-12 lg-desktop:mt-4">
                        <CarouselDots color="brand-400" className="order-1 md:order-2" />
                        <div className=" flex gap-4 order-2 md:order-1">
                            <CarouselPrevious className="absolute top-[47.5%] left-0 lg-touch:static lg-desktop:static h-12 w-12 aspect-square border-secondary-600 text-secondary-400 hover:text-accent-500 hover:border-accent-500 transition-all rounded-none" />
                            <CarouselNext className="absolute top-[47.5%] right-0 lg-touch:static lg-desktop:static h-12 w-12 aspect-square border-secondary-600 text-secondary-400 hover:text-accent-500 hover:border-accent-500 transition-all rounded-none" />
                        </div>
                    </div>
                </div>
            </Carousel>
        </article>
    );
}
