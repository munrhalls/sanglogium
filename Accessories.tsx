"use client";

import data from "./data.json";
import { Carousel, CarouselTrack, CarouselSlide, CarouselNext, CarouselPrevious } from "@/app/components/layout/carousel/Carousel";
import Shelf from "@/app/components/layout/general/Shelf";

export default function Accessories() {
  const categories = [
    { name: "Cables", filter: "cable" },
    { name: "Pads", filter: "pad" },
    { name: "Storage", filter: "storage" }
  ];

  return (
    <Shelf className="bg-white">
      <div className="mb-12 border-b border-zinc-100 pb-6">
        <h2 className="text-display-3 font-bold uppercase italic text-black">
          Essentials <span className="text-brand-400">&</span> Accessories
        </h2>
      </div>

      <div className="flex flex-col gap-20">
        {categories.map((cat) => {
          const items = data.filter(item => 
            item.name.toLowerCase().includes(cat.filter) || 
            item.category?.toLowerCase() === cat.filter
          );

          if (items.length === 0) return null;

          return (
            <div key={cat.name} className="group/section">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-mono uppercase tracking-[0.3em] text-zinc-900 flex items-center gap-4">
                  <span className="h-px w-8 bg-brand-400" />
                  {cat.name}
                </h3>
                <div className="flex gap-2">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              </div>

              <Carousel itemsCount={items.length}>
                <CarouselTrack className="gap-4">
                  {items.map((item) => (
                    <CarouselSlide 
                      key={item._id} 
                      className="min-w-[50%] md:min-w-[33.33%] lg:min-w-[25%] flex-shrink-0"
                    >
                      <div className="group border border-zinc-100 p-4 hover:border-brand-400/30 transition-all bg-white h-full flex flex-col">
                        <div className="aspect-square mb-4 overflow-hidden bg-zinc-50 flex items-center justify-center">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        
                        <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">
                          {item.brand}
                        </p>
                        
                        <h4 className="text-sm font-medium text-zinc-800 line-clamp-2 min-h-[40px] mt-1 leading-snug">
                          {item.name}
                        </h4>
                        
                        <div className="mt-auto pt-4 flex justify-between items-center border-t border-zinc-50">
                          <span className="text-sm font-bold text-zinc-900">
                            
                          </span>
                          <span className="text-[9px] text-brand-500 font-mono uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                            Add to Cart
                          </span>
                        </div>
                      </div>
                    </CarouselSlide>
                  ))}
                </CarouselTrack>
              </Carousel>
            </div>
          );
        })}
      </div>
    </Shelf>
  );
}
