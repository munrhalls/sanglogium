"use client";

import React, { createContext, useContext, ReactNode, useRef, useEffect } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useSnapCarousel } from "@/app/hooks/useSnapCarousel";
import { cn } from "@/lib/utils/tailwind";

// --- 1. CONTEXT DEFINITION ---
type CarouselContextType = ReturnType<typeof useSnapCarousel>;
const CarouselContext = createContext<CarouselContextType | null>(null);

export function useCarousel() {
  const context = useContext(CarouselContext);
  return context;
}

// --- 2. ROOT COMPONENT ---
interface CarouselProps {
  children: ReactNode;
  className?: string;
}

export function Carousel({ children, className = "" }: CarouselProps) {
  const carouselLogic = useSnapCarousel();

  return (
    <CarouselContext.Provider value={carouselLogic}>
      <section
        className={`relative h-full w-full ${className}`}
        aria-roledescription="carousel"
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}



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
        root: track,    // KEY: Watch relative to the track, not the window
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
      className={`group/slide flex min-w-full snap-start flex-col ${className}`}
    >
      {children}
    </div>
  );
}

// --- 3. TRACK COMPONENT ---
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
      className={`no-scrollbar flex min-h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth ${className}`}
    >
      {children}
    </div>
  );
}

// --- 4. NAVIGATION COMPONENTS (Moved Here) ---
const BTN_BASE =
  "flex h-10 w-10 items-center justify-center rounded-full border border-secondary-200/20 bg-brand-800/40 text-brand-400 backdrop-blur-md transition-all hover:bg-brand-500 hover:text-brand-900 active:scale-95 disabled:pointer-events-none disabled:opacity-10 outline-none focus-visible:ring-2 focus-visible:ring-accent-500";

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
      <CaretLeftIcon size={24} weight="light" />
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
      <CaretRightIcon size={24} weight="light" />
    </button>
  );
}
