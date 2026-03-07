import Spotlight from "@/app/components/layout/spotlight/Spotlight";
import {
    Carousel,
    CarouselTrack,
    CarouselSlide,
    CarouselDots,
    CarouselNext,
    CarouselPrevious
} from "@/app/components/layout/carousel/Carousel";
import product from "./prod.json";
import copyData from "./copy.json";

export default function ProductSpotlight3() {
    const copy = copyData as any;

    // FIX: Map Sanity 'gallery' key. Fallback to mainImage array.
    const images = (product as any).gallery || [(product as any).mainImage];

    return (
        <div>
            <Spotlight isReversed={false}>
                <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-center">
                    <p className="text-brand-400 font-mono text-[10px] uppercase tracking-widest text-cap mb-4">
                        {product.brand}
                    </p>

                    <h2 className="text-display-2 font-bold uppercase italic text-brand-100 text-cap mb-6">
                        {product.name}
                    </h2>

                    {/* Spotlight 3 is explicitly isGold: true */}
                    <div className="mb-6">
                        <span className="bg-brand-400 text-black text-[10px] font-bold px-3 py-1 rounded">GOLD STATUS</span>
                    </div>

                    <div className="text-brand-200 leading-relaxed text-body max-w-xl mb-8">
                        {/* Logic check: Focal JSON uses a string 'description' field directly */}
                        {product.description || "The pinnacle of high-fidelity performance."}
                    </div>

                    <p className="text-h2 font-bold text-brand-100 italic">
                        ${product.displayPrice.toLocaleString()}
                    </p>
                </div>

                <div className="lg:col-span-5 order-1 lg:order-2">
                    {/* DESIGN: White Block / Squared (Image 2 Style) */}
                    <div className="bg-white relative group overflow-hidden border border-brand-800/10">
                        <Carousel itemsCount={images.length}>
                            {/* INTERACTION: Required snap classes for active dot tracking */}
                            <CarouselTrack className="flex h-80 lg:h-[450px] overflow-x-auto snap-x snap-mandatory scrollbar-none">
                                {images.map((img: string, idx: number) => (
                                    <CarouselSlide key={idx} className="basis-full flex-shrink-0 snap-center flex items-center justify-center p-8">
                                        <img
                                            src={img}
                                            alt={`${product.name} view ${idx + 1}`}
                                            className="max-h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </CarouselSlide>
                                ))}
                            </CarouselTrack>

                            {/* NAV: High-contrast black circles for the white block */}
                            <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <CarouselPrevious className="bg-black/80 border-none text-white hover:bg-black w-10 h-10 rounded-full" />
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <CarouselNext className="bg-black/80 border-none text-white hover:bg-black w-10 h-10 rounded-full" />
                            </div>

                            {/* DOTS: Absolute positioning above the track */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                                <CarouselDots />
                            </div>
                        </Carousel>
                    </div>
                </div>
            </Spotlight>
        </div>
    );
}