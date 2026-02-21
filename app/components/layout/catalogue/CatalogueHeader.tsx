import type { CatalogueItem } from "./data";
import Image from "next/image";
import {
  CarouselPrevious,
  CarouselNext,
} from "@/app/components/ui/carousel/Carousel";

export default function CatalogueHeader({ data }: { data: CatalogueItem }) {
  return (
    <div className="relative bg-brand-800 py-6 sm:grid sm:grid-cols-1 sm:space-y-6 lg:col-span-4">
      <div className="grid min-h-[clamp(5.04rem,6.72vw+3.36rem,9.52rem)] items-center justify-center text-center">
        <h1 className="text-h1 text-brand-400 text-cap">{data.label}</h1>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative aspect-square w-3/4 shrink-0 overflow-hidden rounded-lg md:w-full">
          <Image
            src={data.imageUrl}
            alt={data.label}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain"
            priority
          />
        </div>
        <div className="absolute inset-x-0 bottom-5 z-10 flex justify-between px-4 sm:hidden">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </div>
    </div>
  );
}
