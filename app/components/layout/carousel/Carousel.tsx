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
  const carouselLogic = useSnapCarousel(itemsCount);
  if (itemsCount === 0) return null;

  const contextValue = React.useMemo(
    () => ({ ...carouselLogic, itemsCount }),
    [carouselLogic, itemsCount]
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <section
        className={cn("relative h-full w-full", className)}
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
      className={cn("no-scrollbar flex h-full w-full", className)}
    >
      {children}
    </div>
  );
}

// 3. SLIDE
export function CarouselSlide({ children, className = "" }) {
  const slideRef = useRef<HTMLDivElement>(null);
  const context = useCarousel();

  useEffect(() => {
    const node = slideRef.current;
    const track = context?.scrollRef.current;
    if (!node || !track) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.active = entry.isIntersecting ? "true" : "false";
      },
      {
        root: track,
        threshold: 0.6,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [context?.scrollRef]);

  return (
    <div ref={slideRef} data-active="false" className={className}>
      {children}
    </div>
  );
}

// --- 4. NAVIGATION COMPONENTS (Moved Here) ---
const BTN_BASE = cn(
  "flex h-8 w-8 items-center justify-center rounded-full",
  "border border-brand-300/35 bg-brand-800/40 text-brand-400",
  "backdrop-blur-md transition-all",
  "hover:bg-brand-500 hover:text-brand-900 active:scale-95",
  "disabled:pointer-events-none disabled:opacity-40",
  "outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
  "before:absolute before:-inset-2 before:content-['']"
);

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

export function CarouselDots({ className }: { className?: string }) {
  const context = useCarousel();
  if (!context) return null;
  const { itemsCount, activeIndex, goTo, visibleCount = 1 } = context;

  return (
    <div className={cn("flex justify-center gap-4 sm:gap-6", className)} role="tablist">
      {Array.from({ length: itemsCount }).map((_, i) => {
        const isAnchor = i === activeIndex;
        const isInView = i > activeIndex && i < activeIndex + visibleCount;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isAnchor}
            onClick={() => goTo(i)}
            className="group relative flex cursor-pointer touch-manipulation items-center justify-center transition-transform active:scale-95 focus-visible:outline-none"
          >
            <CarouselIcon
              className={cn(
                "h-2 w-2 sm:h-4 sm:w-4 transition-all duration-500",
                isAnchor ? "text-brand-400 opacity-100 scale-110" :
                isInView ? "text-brand-400 opacity-65 grayscale-0" :
                "text-brand-400 opacity-45 grayscale"
              )}
            />
            <div className="absolute -inset-1 hidden rounded-full ring-2 ring-brand-400/50 group-focus-visible:block" />
          </button>
        );
      })}
    </div>
  );
}
