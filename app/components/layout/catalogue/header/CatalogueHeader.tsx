import { cn } from "@/lib/utils/tailwind";
import type { CatalogueItem } from "../data";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/ui/carousel/Carousel";
import BGImage from "./BGImage";
import Title from "./Title";

export default function CatalogueHeader({ data }: { data: CatalogueItem }) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden bg-brand-900 px-8",
        "h-[clamp(96px,30dvh,256px)]",
        "sm:h-1/2",
        "landscape:h-full landscape:w-1/2 landscape:flex-row landscape:justify-between",
        "landscape:shrink-0 landscape:px-4 landscape:py-4",

        "lg:landscape:max-w-[var(--catalogue-header-max-w,400px)]"
      )}
    >
      <style>{`
        @keyframes pendulum {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(3deg); }
        }
      `}</style>

      <BGImage data={data} />

      <div
        className={cn(
          "absolute bottom-3 left-4 right-4 z-30 bg-black/30 py-2",
          "landscape:bottom-auto landscape:left-8 landscape:right-auto landscape:top-4"
        )}
      >
        <CarouselDots />
      </div>

      <Title label={data.label} />
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
