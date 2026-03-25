"use client";

import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";

import { CatalogueView } from "@/app/components/layout/catalogue/CatalogueView";
import catalogueDataRaw from "@/app/components/layout/catalogue/catalogue.json";
import type { CatalogueItem } from "@/app/components/layout/catalogue/data";

import { cn } from "@/lib/utils/tailwind";

export default function CatalogueCarousel() {
  // Transform catalogue.json to match original CatalogueItem interface
  const catalogueData: CatalogueItem[] = catalogueDataRaw.catalogue.map((item: any) => ({
    id: item.slug?.current || item.title.toLowerCase().replace(/\s+/g, '-'),
    label: item.title,
    imageUrl: `/images/${item.icon}-skeletal.png`,
    sections: (item.children || []).map((child: any) => ({
      title: child.title,
      links: (child.children || []).map((link: any) => link.title)
    })),
    feature: {
      caption: "Pure Resonance"
    }
  }));

  return (
    <nav
      aria-label="Catalogue Navigation"
      className="flex h-full w-full flex-col"
    >
      <Carousel itemsCount={catalogueData.length}>
        <CarouselTrack className="touch-pan-x snap-x snap-mandatory overflow-x-auto landscape:h-full rounded-none">
          {catalogueData.map((item, index) => (
            <CarouselSlide
              key={item.id}
              className="group/animation-settle flex h-full min-w-full flex-1 snap-start snap-always flex-col"
            >
              <div
                className={cn(
                  "duration-450 h-full w-full flex-1 opacity-15 transition-all ease-in-out will-change-transform",
                  "flex flex-col group-data-[active=true]/animation-settle:opacity-100"
                )}
              >
                <CatalogueView data={item} />
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
