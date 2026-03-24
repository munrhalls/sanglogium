import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from '@/app/components/layout/carousel/CarouselControls';
import AccessoryCard from "./AccessoryCard";

interface CategorySectionProps {
  category: AccessoryCategory;
  items: AccessoryItem[];
}

const accessoriesBreakpointMap = {
  xl: 4,
  lgDesktop: 4,
  mdLandscape: 4,
  mdPortrait: 3,
  smLandscape: 3,
  smPortrait: 2,
  mobileLandscape: 1,
  mobilePortrait: 1
};

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
    <Carousel itemsCount={filteredItems.length} breakpointMap={accessoriesBreakpointMap}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <div className="flex flex-col gap-4 md:col-start-1 md:row-start-1">
          <h3 className="text-small text-cap font-bold uppercase flex items-center gap-3">
            <span className="h-px w-8 bg-brand-400" />
            {category.name}
          </h3>
        </div>

        <CarouselTrack className="w-full relative mx-0 items-stretch md:-mx-3 md:col-span-full md:row-start-2">
          {filteredItems.map((item, idx) => (
            <CarouselSlide
              key={`${category.filter}-${item._id}`}
              className="flex h-full flex-col px-3"
            >
              <AccessoryCard item={item} idx={idx} />
            </CarouselSlide>
          ))}
        </CarouselTrack>

        <div className="flex items-center justify-center md:flex-row gap-4 md:gap-8 md:col-start-2 md:row-start-1 md:justify-self-end md:pr-16">
          <CarouselPrevious
            className="transition-colors border-none shadow-none h-4 w-4 hover:bg-transparent focus:ring-0 active:scale-110 text-brand-400"
          />
          <CarouselDots color="brand-400" />
          <CarouselNext
            className="transition-colors border-none shadow-none h-4 w-4 hover:bg-transparent focus:ring-0 active:scale-105 text-brand-400"
          />
        </div>
      </div>
    </Carousel>
  );
}


