import Image from "next/image";
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

export default function ProductSpotlight1() {
  const copy = copyData as any;
  const images = (product as any).gallery || [(product as any).mainImage];

  return (
    <Spotlight isReversed={false}>
      {/* COLUMN 1: CONTENT (The Void) */}
      <div className="bg-brand-700 lg:col-span-7 order-2 lg:order-1 flex flex-col justify-center p-8 lg:p-12">
        <p className="text-brand-400 font-mono text-[10px] uppercase tracking-widest text-cap mb-4">
          {product.brand}
        </p>

        <h2 className="text-display-2 font-bold uppercase italic text-brand-400 text-cap mb-6">
          {product.name}
        </h2>

        <div className="text-secondary-300 leading-relaxed text-body max-w-xl mb-8">
          {typeof copy.text === 'string' ? copy.text : "Refined closed-back excellence featuring Macassar ebony wood."}
        </div>

        <p className="text-h2 font-bold text-brand-100 italic">
          ${product.displayPrice.toLocaleString()}
        </p>

        {/* CTA: Spotlight Style (Thin, Caps, No BG) */}
        <button className="mt-8 self-start text-spotlight font-regular uppercase text-brand-400 hover:text-brand-200 transition-colors text-cap">
          See More
        </button>
      </div>

      {/* COLUMN 2: IMAGE BLOCK (Platinum) */}
      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="bg-secondary-300 relative group overflow-hidden border border-brand-800/10 h-full min-h-[450px]">
          <Carousel itemsCount={images.length}>
            <CarouselTrack className="flex h-full min-h-[450px] overflow-x-auto snap-x snap-mandatory scrollbar-none">
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

            <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <CarouselPrevious className="bg-black/80 border-none text-white hover:bg-black w-10 h-10 rounded-full" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <CarouselNext className="bg-black/80 border-none text-white hover:bg-black w-10 h-10 rounded-full" />
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
              <CarouselDots />
            </div>
          </Carousel>
        </div>
      </div>
    </Spotlight>
  );
}