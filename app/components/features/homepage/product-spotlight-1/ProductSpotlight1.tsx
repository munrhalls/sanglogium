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

  // FIX: Map 'gallery' from Sanity data, fallback to 'mainImage'
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

          <div className="text-brand-200 leading-relaxed text-body max-w-xl mb-8">
            {/* Sanity Portable Text fallback logic */}
            {typeof copy.text === 'string' ? copy.text : "Refined closed-back excellence featuring Macassar ebony wood and QWRM technology."}
          </div>

          <p className="text-h2 font-bold text-brand-100 italic">
            ${product.displayPrice.toLocaleString()}
          </p>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          {/* DESIGN FIX: Image 2 Style - Squared, White Block, High Contrast */}
          <div className="bg-white relative group overflow-hidden border border-brand-800/10">
            <Carousel itemsCount={images.length}>
              {/* LOGIC FIX: snap-x and overflow-x-auto are required for Dots to function */}
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

              {/* NAV FIX: High Z-Index and clean black buttons (Image 2 style) */}
              <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <CarouselPrevious className="bg-black/80 border-none text-white hover:bg-black w-10 h-10 rounded-full" />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <CarouselNext className="bg-black/80 border-none text-white hover:bg-black w-10 h-10 rounded-full" />
              </div>

              {/* DOTS FIX: Elevated above the track */}
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