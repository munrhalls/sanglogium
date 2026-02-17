"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useSnapCarousel } from "@/app/hooks/useSnapCarousel";
import { cn } from "@/lib/utils/tailwind";

// --- 1. CONTEXT DEFINITION ---
type CarouselContextType = ReturnType<typeof useSnapCarousel>;
const CarouselContext = createContext<CarouselContextType | null>(null);

function useCarousel() {
  return useContext(CarouselContext);
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
        className={`relative w-full ${className}`}
        aria-roledescription="carousel"
      >
        {children}
      </section>
    </CarouselContext.Provider>
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
  const { scrollRef } = useCarousel();

  return (
    <div
      ref={scrollRef}
      className={`no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth ${className}`}
    >
      {React.Children.map(children, (child) => (
        <div className="min-w-full snap-start">{child}</div>
      ))}
    </div>
  );
}

// --- 4. NAVIGATION COMPONENTS (Moved Here) ---
const BTN_BASE =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:h-12 md:w-12";

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
      <CaretLeftIcon size={32} weight="light" />
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
      <CaretRightIcon size={32} weight="light" />
    </button>
  );
}
