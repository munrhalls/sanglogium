import type { CatalogueItem } from "./data";
import Image from "next/image";
// import {
//   CarouselPrevious,
//   CarouselNext,
// } from "@/app/components/ui/carousel/Carousel";

export default function CatalogueHeader({ data }: { data: CatalogueItem }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="relative aspect-square h-[33vh] max-w-[70vw] shrink-0 overflow-hidden rounded-full border-4 border-brand-400 bg-brand-800 shadow-xl">
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
          <h1 className="text-xl font-bold uppercase text-brand-400">
            {data.label}
          </h1>
        </div>
        <Image
          src={data.imageUrl}
          alt={data.label}
          fill
          className="object-cover opacity-60"
          priority
        />
      </div>
    </div>
  );
}

// <div className="absolute inset-x-0 bottom-5 z-10 flex justify-between px-4 sm:hidden">
//   <CarouselPrevious className="static translate-y-0" />
//   <CarouselNext className="static translate-y-0" />
// </div>
