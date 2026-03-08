import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import { CarouselDots } from '@/app/components/layout/carousel/CarouselControls';
import AccessoryCard from "./AccessoryCard";

interface CategorySectionProps {
  category: { name: string; filter: string };
  items: any[];
}

export default function CategorySection({ category, items }: CategorySectionProps) {
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(category.filter) ||
    item.category?.toLowerCase() === category.filter
  );

  const filteredItems = Array.from(
    new Map(filtered.map((item) => [item._id, item])).values()
  );

  if (filteredItems.length === 0) return null;

  return (
    <div className="group/section">
      <h3 className="text-small text-cap font-bold uppercase text-brand-400 mb-6 flex items-center gap-3">
        <span className="h-px w-8 bg-brand-400" />
        {category.name}
      </h3>

      <Carousel itemsCount={filteredItems.length}>
        <CarouselTrack className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4">
          {filteredItems.map((item) => (
            <CarouselSlide
              key={`${category.filter}-${item._id}`}
              className="min-w-[160px] basis-1/2 // @coherence-bypass md:basis-1/4 lg:basis-1/6 flex-shrink-0 snap-start"
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


