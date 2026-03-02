"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useRef,
  useEffect,
  Children,
} from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useSnapCarousel } from "@/app/hooks/useSnapCarousel";
import { cn } from "@/lib/utils/tailwind";
import { CarouselIcon } from "./DotIcon";

// --- 1. CONTEXT DEFINITION ---
type CarouselContextType = ReturnType<typeof useSnapCarousel> & {
  itemsCount: number;
};
const CarouselContext = createContext<CarouselContextType | null>(null);

export function useCarousel() {
  const context = useContext(CarouselContext);
  return context;
}

// --- 2. ROOT COMPONENT ---
interface CarouselProps {
  children: ReactNode;
  className?: string;
  itemsCount: number;
}

export function Carousel({
  children,
  className = "",
  itemsCount = 0,
}: CarouselProps) {
  const carouselLogic = useSnapCarousel();
  if (itemsCount === 0) return null;

  const contextValue = React.useMemo(
    () => ({ ...carouselLogic, itemsCount }),
    [carouselLogic, itemsCount]
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <section
        className={`relative h-full w-full ${className}`}
        aria-roledescription="carousel"
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

// --- 2. TRACK COMPONENT ---
interface CarouselTrackProps {
  children: ReactNode;
  className?: string;
}

export function CarouselTrack({
  children,
  className = "",
}: CarouselTrackProps) {
  const context = useCarousel();

  if (!context) return <div className={className}>{children}</div>;

  const { scrollRef } = context;

  return (
    <div
      ref={scrollRef}
      data-vaul-no-drag
      className={cn(
        "no-scrollbar flex min-h-full w-full touch-pan-x snap-x snap-mandatory overflow-x-auto landscape:h-full",
        className
      )}
    >
      {children}
    </div>
  );
}

// 3. SLIDE
export function CarouselSlide({ children, className = "" }) {
  const slideRef = useRef<HTMLDivElement>(null);
  const { scrollRef } = useCarousel()!; // Get the track ref from your context

  useEffect(() => {
    const node = slideRef.current;
    const track = scrollRef.current;
    if (!node || !track) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // We use the attribute to trigger the CSS
        node.dataset.active = entry.isIntersecting ? "true" : "false";
      },
      {
        root: track, // KEY: Watch relative to the track, not the window
        threshold: 0.6, // 60% visibility is the 'sweet spot' for snapping
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollRef]);

  return (
    <div
      ref={slideRef}
      data-active="false"
      className={cn(
        "group/slide flex min-w-full snap-start snap-always flex-col",
        className
      )}
    >
      <div className="/* Child: The Glide Layer (Compositor Lane) */ duration-450 /* Inactive State */ /* Active State */ h-full w-full opacity-15 transition-all ease-in-out will-change-transform group-data-[active=true]/slide:opacity-100">
        {children}
      </div>
    </div>
  );
}

// --- 4. NAVIGATION COMPONENTS (Moved Here) ---
const BTN_BASE =
  "flex h-6 w-6 items-center justify-center rounded-full border border-brand-300/35 bg-brand-800/40 text-brand-400 backdrop-blur-md transition-all hover:bg-brand-500 hover:text-brand-900 active:scale-95 disabled:pointer-events-none disabled:opacity-10 outline-none focus-visible:ring-2 focus-visible:ring-accent-500";

interface NavBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function CarouselPrevious({ className, ...props }: NavBtnProps) {
  const context = useCarousel();

  // 2. Graceful exit: If no carousel provider, render nothing.
  if (!context) return null;

  const { scrollPrev, canScrollPrev } = context;
  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <CaretLeftIcon size={16} weight="light" />
    </button>
  );
}

export function CarouselNext({ className, ...props }: NavBtnProps) {
  const context = useCarousel();

  // 2. Graceful exit: If no carousel provider, render nothing.
  if (!context) return null;

  const { scrollNext, canScrollNext } = context;
  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <CaretRightIcon size={16} weight="light" />
    </button>
  );
}

interface CarouselDotsProps {
  className?: string;
}

export function CarouselDots({ className }: CarouselDotsProps) {
  const context = useCarousel();

  if (!context) return null;
  const { itemsCount, activeIndex, goTo } = context;

  return (
    <div className={cn("flex justify-center gap-4", className)} role="tablist">
      {Array.from({ length: itemsCount }).map((_, i) => {
        const isActive = activeIndex === i;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="group relative flex cursor-pointer touch-manipulation items-center justify-center transition-transform focus-visible:outline-none active:scale-95"
            style={{ isolation: "isolate" }}
          >
            <CarouselIcon
              className={cn(
                "h-2 w-2 sm:h-4 sm:w-4",
                isActive
                  ? "text-brand-400 opacity-100"
                  : "opacity-35 grayscale hover:opacity-70"
              )}
            />

            {/* Focus Ring - Semantic and clear without shifting layout */}
            <div className="absolute -inset-1 hidden rounded-full ring-2 ring-brand-400/50 group-focus-visible:block" />
          </button>
        );
      })}
    </div>
  );
}
