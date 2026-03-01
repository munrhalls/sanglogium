import type { CatalogueItem } from "./data";
import Image from "next/image";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots
} from "@/app/components/ui/carousel/Carousel";

export default function CatalogueHeader({
  data,
  index,
}: {
  data: CatalogueItem;
  index: number;
}) {
  return (
    <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden bg-brand-900 px-8 landscape:px-4 landscape:flex-row landscape:justify-between landscape:py-4 landscape:h-full landscape:w-1/2 landscape:max-w-72 landscape:shrink-0">
      {/* 1. The Image Layer: Scaled up and centered behind text */}
      <div className="absolute h-56 w-56 opacity-40 grayscale transition-all duration-700 hover:scale-110 hover:opacity-40 [animation:pendulum_8s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite_alternate] landscape:aspect-square landscape:w-full">
        <style>{`
          @keyframes pendulum {
            0% { transform: rotate(-2deg); }
            100% { transform: rotate(3deg); }
          }
        `}</style>
        <Image
          src={data.imageUrl}
          alt={data.label}
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="absolute bottom-2 left-4 right-4 landscape:top-4 landscape:right-auto landscape:left-8 z-40">
        <CarouselDots />
      </div>

      {/* 2. The Text Layer: Directly on top with luxury tracking */}
      <div key={data.label}>
          <h1 className="opacity-0 translate-y-2 transition-all duration-500
  group-data-[active=true]/slide:opacity-100
  group-data-[active=true]/slide:translate-y-0
  group-data-[active=true]/slide:delay-150 relative z-10 text-center text-2xl font-bold uppercase tracking-[0.3em] text-brand-400 landscape:text-left">
            {data.label}
          </h1>
      </div>
      {/* 3. Carousel Controls: Grouped Instrument Cluster */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2 landscape:right-auto landscape:left-4 sm:right-8">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>

      {/* 3. Minimalist Spacer: Creates breathing room for the list below */}
      <div className="absolute bottom-0 h-px w-16 bg-brand-500/20" />
    </div>
  );
}
