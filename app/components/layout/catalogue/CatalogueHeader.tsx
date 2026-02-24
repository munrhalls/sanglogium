import type { CatalogueItem } from "./data";
import Image from "next/image";
import {
  CarouselPrevious,
  CarouselNext,
} from "@/app/components/ui/carousel/Carousel";
import { SlideActiveTrigger } from "@/app/components/ui/carousel/SlideActiveTrigger";

export default function CatalogueHeader({
  data,
  index,
}: {
  data: CatalogueItem;
  index: number;
}) {
  return (
    <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden bg-brand-900 px-8">
      {/* 1. The Image Layer: Scaled up and centered behind text */}
      <div className="absolute h-56 w-56 opacity-40 grayscale transition-all duration-700 hover:scale-110 hover:opacity-40">
        <Image
          src={data.imageUrl}
          alt={data.label}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* 2. The Text Layer: Directly on top with luxury tracking */}
      <div key={data.label}>
        <SlideActiveTrigger key={data.label} index={index} delay={0}>
          <h1 className="relative z-10 text-center text-2xl font-bold uppercase tracking-[0.3em] text-brand-400">
            {data.label}
          </h1>
        </SlideActiveTrigger>
      </div>
      {/* 3. Carousel Controls: Grouped Instrument Cluster */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2 sm:right-8">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>

      {/* 3. Minimalist Spacer: Creates breathing room for the list below */}
      <div className="absolute bottom-0 h-px w-16 bg-brand-500/20" />
    </div>
  );
}
