import type { CatalogueItem } from "./data";
import Image from "next/image";
import {
  CarouselPrevious,
  CarouselNext,
} from "@/app/components/ui/carousel/Carousel";
import { InViewSection } from "@/app/components/ui/in-view-section/InViewSection";

export default function CatalogueHeader({ data }: { data: CatalogueItem }) {
  return (
    <div className="bg-brand-900 relative flex h-64 w-full flex-col items-center justify-center overflow-hidden px-8">
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
      <InViewSection key={data.label} delay={0.1}>
        <h1 className="relative z-10 text-center text-2xl font-bold uppercase tracking-[0.3em] text-brand-400">
          {data.label}
        </h1>
      </InViewSection>

      {/* 3. Carousel Controls: Grouped Instrument Cluster */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2 sm:right-8">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>

      {/* 3. Minimalist Spacer: Creates breathing room for the list below */}
      <div className="bg-brand-500/20 absolute bottom-0 h-px w-16" />
    </div>
  );
}
