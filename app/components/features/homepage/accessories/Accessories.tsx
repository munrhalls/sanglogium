"use client";

import data from "./data.json";
import { Carousel, CarouselTrack, CarouselSlide, CarouselDots } from "@/app/components/layout/carousel/Carousel";

export default function Accessories() {
  const categories = [
    { name: "Cables", filter: "cable" },
    { name: "Pads", filter: "pad" },
    { name: "Storage", filter: "case" }
  ];

  return (
    <div className="w-full space-y-20">
      <div className="border-b border-brand-800/30 pb-4">
        <h2 className="text-display-2 font-bold uppercase italic text-brand-100 text-cap">
          Essentials <span className="text-brand-400">&</span> Accessories
        </h2>
      </div>

      {categories.map((cat) => (
        <CategorySection key={cat.name} category={cat} />
      ))}
    </div>
  );
}

function CategorySection({ category }: { category: { name: string, filter: string } }) {
  const filteredItems = data.filter(item =>
    item.name.toLowerCase().includes(category.filter) ||
    item.category?.toLowerCase() === category.filter
  );

  if (filteredItems.length === 0) return null;

  return (
    <div className="group/section">
      <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-400 mb-6 flex items-center gap-3">
        <span className="h-px w-8 bg-brand-400" />
        {category.name}
      </h3>

      <Carousel itemsCount={filteredItems.length}>
        <CarouselTrack className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4">
          {filteredItems.map((item) => (
            <CarouselSlide
              key={item._id}
              className="min-w-[160px] basis-[45%] md:basis-1/4 lg:basis-1/6 flex-shrink-0 snap-start"
            >
              <div className="bg-brand-800/10 border border-brand-800/20 p-4 group transition-all duration-500 hover:border-brand-400/40">
                <div className="h-32 w-full flex items-center justify-center p-2 mb-4 bg-black/20">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-brand-400">
                    {item.brand}
                  </span>
                  <h4 className="text-[11px] font-medium leading-tight text-brand-100 line-clamp-2 h-8">
                    {item.name}
                  </h4>
                  <div className="flex justify-between items-center pt-2 border-t border-brand-800/30">
                    <span className="text-xs font-bold text-brand-200">${item.displayPrice}</span>
                    <button className="text-[9px] font-bold text-brand-400 uppercase hover:text-brand-100">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
        <div className="mt-4 opacity-0 group-hover/section:opacity-100 transition-opacity duration-500">
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  );
}
