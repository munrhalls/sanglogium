import { cn } from "@/lib/utils/tailwind";
import type { CatalogueNavItem } from "../catalogue-nav.types";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/layout/carousel/CarouselControls";
import HeroImage from "./HeroImage";
import SliceTitle from "./SliceTitle";

// BACKLOG TODO - make sure the title is lifted up and doesn't squeeze onto nav arrows on very old tiny iphones
// BACKLOG TODO - make sure arrows are smaller on very tiny phones viewport
// BACKLOGO TODO - ^ same for landscape on tiny phones viewport or narrow height viewport

export default function SliceHero({ data }: { data: CatalogueNavItem }) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden bg-brand-900 px-8",
        "h-[clamp(96px,30dvh,256px)]",
        "sm:h-1/2",
        "landscape:h-full landscape:w-1/2 landscape:flex-row landscape:justify-between",
        "landscape:shrink-0 landscape:px-4 landscape:py-4",
        "lg-touch:landscape:max-w-[var(--catalogue-hero-max-w,400px)]",
        "lg-desktop:landscape:w-1/3"
      )}
    >
      <style>{`
        @keyframes pendulum {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(3deg); }
        }
      `}</style>

      <HeroImage data={data} />

      <div
        className={cn(
          "absolute bottom-3 left-4 right-4 z-30 bg-black/30 py-2",
          "landscape:bottom-auto landscape:left-8 landscape:right-auto landscape:top-4",
          "lg-desktop:landscape:hidden"
        )}
      >
        <CarouselDots />
      </div>

      <SliceTitle label={data.label} />
      {/* 3. Carousel Controls: Grouped Instrument Cluster */}
      <div
        className={cn(
          "absolute bottom-2 left-4 z-40 flex",
          "gap-4 sm:gap-6",
          "landscape:bottom-4 landscape:left-4 landscape:right-auto",
          "sm:left-20 sm:landscape:left-16",
          "lg-desktop:landscape:hidden"
        )}
      >
        <CarouselPrevious className="static translate-y-0 text-brand-400" />
        <CarouselNext className="static translate-y-0 text-brand-400" />
      </div>

      {/* 3. Minimalist Spacer: Creates breathing room for the list below */}
      <div className="absolute bottom-0 h-px w-16 bg-brand-500/20" />
    </div>
  );
}
