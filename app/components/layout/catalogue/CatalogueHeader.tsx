import { cn } from "@/lib/utils/tailwind";
import type { CatalogueItem } from "./data";
import Image from "next/image";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/ui/carousel/Carousel";

export default function CatalogueHeader({
  data,
  index,
}: {
  data: CatalogueItem;
  index: number;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden bg-brand-900 px-8",
        "h-[clamp(96px,30dvh,256px)]",
        "sm:h-1/2 sm:w-full sm:max-w-full",
        "landscape:h-full landscape:w-1/2 landscape:max-w-72 landscape:shrink-0 landscape:flex-row landscape:justify-between landscape:px-4 landscape:py-4",
        // "[@media(min-width:1024px)_and_(max-height:850px)]:!max-w-[400px]"
        "max-w-[var(--catalogue-header-max-w,288px)]"
      )}
    >
      {/* 1. The Image Layer: Scaled up and centered behind text */}
      <div
        className={cn(
          "absolute h-96 w-96 opacity-40 grayscale",
          "transition-all duration-700 hover:scale-110",
          "[animation:pendulum_8s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite_alternate]",
          "sm:h-[960px] sm:w-[960px]",
          "landscape:aspect-square landscape:h-[512px] landscape:w-[512px]"
        )}
      >
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
      <div
        className={cn(
          "absolute bottom-3 left-4 right-4 z-30 bg-black/30 py-2",
          "landscape:bottom-auto landscape:left-8 landscape:right-auto landscape:top-4"
        )}
      >
        <CarouselDots />
      </div>

      {/* 2. The Text Layer: Directly on top with luxury tracking */}
      <div
        key={data.label}
        className={cn(
          "flex h-full w-full items-center justify-center pt-8",
          "sm:items-center landscape:items-center"
        )}
      >
        <h1
          className={cn(
            "relative z-10 translate-y-2 pb-6 text-center text-h4 font-bold uppercase tracking-[0.3em] text-brand-400 opacity-0 transition-all duration-500 text-cap",
            "group-data-[active=true]/slide:translate-y-0 group-data-[active=true]/slide:opacity-100 group-data-[active=true]/slide:delay-150",
            "sm:text-h2",
            "landscape:text-center"
          )}
        >
          {data.label}
        </h1>
      </div>
      {/* 3. Carousel Controls: Grouped Instrument Cluster */}
      <div
        className={cn(
          "absolute bottom-2 left-4 z-40 flex",
          "gap-4 sm:gap-6",
          "landscape:bottom-4 landscape:left-4 landscape:right-auto",
          "sm:left-20 sm:landscape:left-16"
        )}
      >
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>

      {/* 3. Minimalist Spacer: Creates breathing room for the list below */}
      <div className="absolute bottom-0 h-px w-16 bg-brand-500/20" />
    </div>
  );
}
