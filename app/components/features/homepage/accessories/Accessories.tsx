"use client";

import data from "./data.json";
import { Carousel, CarouselTrack, CarouselSlide, CarouselDots } from "@/app/components/layout/carousel/Carousel";
import AccessoriesHeader from "./AccessoriesHeader";
import AccessoryCard from "./AccessoryCard";

export default function Accessories() {
  const categories = [
    { name: "Cables", filter: "cable" },
    { name: "Pads", filter: "pad" },
    { name: "Storage", filter: "case" }
  ];

  return (
    <div className="w-full space-y-20">
      <AccessoriesHeader />

      {categories.map((cat) => (
        <CategorySection key={cat.name} category={cat} />
      ))}
    </div>
  );
}

function CategorySection({ category }: { category: { name: string; filter: string } }) {
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
              <AccessoryCard item={item} />
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
