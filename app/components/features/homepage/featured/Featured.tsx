"use client";

import products from "./content-dump.json";
import { 
  Carousel, 
  CarouselTrack, 
  CarouselSlide, 
  CarouselNext, 
  CarouselPrevious,
  CarouselDots
} from "@/app/components/layout/carousel/Carousel";

export default function Featured() {
  const VISIBLE_COUNT = 5;
  if (!products || products.length === 0) return null;

  // The 'Window Cap' logic: Stops the carousel when the last item is in view
  const maxSlides = products.length - (VISIBLE_COUNT - 1);

  return (
    <section className="bg-zinc-950 py-24 overflow-hidden border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        
        <Carousel itemsCount={maxSlides}>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-light text-white uppercase italic tracking-tighter">
                Featured <span className="text-amber-500 font-bold not-italic">Spotlight</span>
              </h2>
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] mt-2">Precision Audio Selection</p>
            </div>
            <div className="flex gap-2">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>

          <CarouselTrack>
            {products.slice(0, maxSlides).map((_, index) => (
              <CarouselSlide key={index} className="w-full min-w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {products.slice(index, index + VISIBLE_COUNT).map((product, pIdx) => (
                    <div 
                      key={product._id + pIdx} 
                      className="bg-zinc-900/30 border border-zinc-800/50 p-6 flex flex-col h-full hover:bg-zinc-900/80 transition-colors duration-500 group"
                    >
                      <div className="aspect-square mb-6 flex items-center justify-center bg-zinc-950/50 overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="max-h-32 object-contain group-hover:scale-110 transition-transform duration-700" 
                        />
                      </div>
                      <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2">{product.brand}</span>
                      <h3 className="text-zinc-100 text-xs font-light line-clamp-2 mb-6 leading-relaxed">{product.name}</h3>
                      <p className="mt-auto text-xl font-light text-white tracking-tighter">
                        $\
                      </p>
                    </div>
                  ))}
                </div>
              </CarouselSlide>
            ))}
          </CarouselTrack>

          <CarouselDots className="mt-12" />
        </Carousel>
      </div>
    </section>
  );
}