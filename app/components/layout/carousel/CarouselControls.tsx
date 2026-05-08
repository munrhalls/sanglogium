"use client";

import React from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";
import { CarouselIcon } from "./DotIcon";

const BTN_BASE = cn(
  "group relative flex h-8 w-8 items-center justify-center rounded-full",
  "text-brand-700 transition-all duration-200",
  "hover:text-brand-950 active:scale-110",
  "disabled:pointer-events-none disabled:opacity-40",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50",
  "before:absolute before:-inset-2 before:content-['']"
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

export function CarouselDots({ className, color = "brand-400" }: { className?: string; color?: string }) {
  const context = useCarousel();
  if (!context) return null;

  const { itemsCount, activeIndex, goTo, visibleCount = 1 } = context;
  const vCount = Number(visibleCount);
  const aIndex = Math.round(Number(activeIndex));

  const colorClasses = color === "brand-700"
    ? { text: "text-brand-700" }
    : { text: "text-brand-400" };

  return (
    <div className={cn("flex justify-center gap-4 sm:gap-6", className)} role="tablist">
      {Array.from({ length: itemsCount }).map((_, i) => {
        const isAnchor = i === aIndex;
        const isInView = !isAnchor && i >= aIndex && i < (aIndex + Math.ceil(vCount));

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isAnchor}
            onClick={() => goTo(i)}
            className="group relative flex cursor-pointer touch-manipulation items-center justify-center transition-transform active:scale-95 focus-visible:outline-none before:absolute before:-inset-2 before:content-['']"
          >
            {isAnchor ? (
              <CarouselIcon
                className={cn(
                  "h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-500 opacity-100 scale-110",
                  colorClasses.text
                )}
              />
            ) : (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "h-2 w-2 sm:h-3 sm:w-3 transition-all duration-500 rounded-full",
                  colorClasses.text,
                  isInView ? "opacity-85 scale-100" : "opacity-60 lg-touch:opacity-45 lg-desktop:opacity-45"
                )}
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
                <circle cx="8" cy="8" r="7" fill="#FEFCFB" className="opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
              </svg>
            )}
            <div className="absolute -inset-1 hidden rounded-full ring-2 ring-brand-400/50 group-focus-visible:block" />
          </button>
        );
      })}
    </div>
  );
}
