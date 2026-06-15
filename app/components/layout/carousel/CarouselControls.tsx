"use client";

import React from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

const BTN_BASE = cn(
  "group relative flex h-11 w-11 items-center justify-center rounded-full",
  "bg-surface-elevated/80 border border-border-secondary backdrop-blur-sm",
  "text-brand-100 transition-all duration-200",
  "hover:bg-surface-card hover:text-brand-50 active:scale-110",
  "disabled:pointer-events-none disabled:opacity-40",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
);

export function CarouselPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollPrev, canScrollPrev } = context;

  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Previous slide"
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <CaretLeftIcon weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

export function CarouselNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollNext, canScrollNext } = context;

  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Next slide"
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <CaretRightIcon weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

export function CarouselDots({ className }: { className?: string }) {
  const context = useCarousel();
  if (!context) return null;

  const { itemsCount, activeIndex, goTo } = context;
  const aIndex = Math.round(Number(activeIndex));

  // Windowing: show max 7 dots, centered on active index
  const maxVisible = 7;
  let start = 0;
  let end = itemsCount;

  if (itemsCount > maxVisible) {
    const half = Math.floor(maxVisible / 2);
    start = Math.max(0, aIndex - half);
    end = Math.min(itemsCount, start + maxVisible);
    if (end - start < maxVisible) {
      start = end - maxVisible;
    }
  }

  const visibleIndices = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div className={cn("flex justify-center items-center", className)} role="tablist">
      {visibleIndices.map((i) => {
        const isActive = i === aIndex;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="mx-1 flex cursor-pointer touch-manipulation items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            <span
              className={cn(
                "block h-2 w-2 rounded-full transition-colors duration-300",
                isActive
                  ? "bg-brand-700"
                  : "bg-secondary-300 hover:bg-secondary-500"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
