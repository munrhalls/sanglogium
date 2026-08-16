import { Carousel } from '@/app/components/layout/carousel/CarouselRoot';
import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from '@/app/components/layout/carousel/CarouselControls';
import AccessoryCard from "./AccessoryCard";
import { AccessoryCategory, AccessoryItem } from "./types";

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
  xsLandscape: 2,
  xsPortrait: 2,
  mobileLandscape: 1,
  mobilePortrait: 2
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
      <div className="flex flex-col gap-6">
        <h3 className="type-caption text-brand-400 font-bold uppercase">
          <span className="section-header-anchor">{category.name}</span>
        </h3>

        <div className="relative">
          <CarouselTrack className="w-full mx-0 items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
            {filteredItems.map((item, idx) => (
              <CarouselSlide
                key={`${category.filter}-${item._id}`}
                className="flex flex-col px-2 md:px-3"
              >
                <AccessoryCard item={item} idx={idx} />
              </CarouselSlide>
            ))}
          </CarouselTrack>
        </div>

        <div className="flex justify-center items-center gap-4 pt-3">
          <CarouselPrevious
            iconStyle="chevron"
            size={24}
            weight="bold"
            className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 h-9 w-9"
          />
          <CarouselDots truncate />
          <CarouselNext
            iconStyle="chevron"
            size={24}
            weight="bold"
            className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 h-9 w-9"
          />
        </div>
      </div>
    </Carousel>
  );
}


