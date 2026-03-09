"use client";

import React from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";
import { CarouselIcon } from "./DotIcon";

const BTN_BASE = cn(
  "flex h-8 w-8 items-center justify-center rounded-full",
  "border border-brand-300/35 bg-brand-800/40 text-brand-400",
  "backdrop-blur-md transition-all",
  "hover:bg-brand-500 hover:text-brand-900 active:scale-95",
  "disabled:pointer-events-none disabled:opacity-40",
  "outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
  "before:absolute before:-inset-2 before:content-['']"
);

interface NavBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { bg?: string; iconColor?: string;
  className?: string;
}

export function CarouselPrevious({ className, bg = "bg-brand-800/40", iconColor = "text-brand-400", ...props }: NavBtnProps) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollPrev, canScrollPrev } = context;
  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={cn(BTN_BASE, bg, iconColor, className)}
      {...props}
    >
      <CaretLeftIcon size={16} weight="light" />
    </button>
  );
}

export function CarouselNext({ className, bg = "bg-brand-800/40", iconColor = "text-brand-400", ...props }: NavBtnProps) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollNext, canScrollNext } = context;
  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={cn(BTN_BASE, bg, iconColor, className)}
      {...props}
    >
      <CaretRightIcon size={16} weight="light" />
    </button>
  );
}

export function CarouselDots({ className, color = "brand-400" }: { className?: string; color?: string }) {
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
                isAnchor ? `text-${color} opacity-100 scale-110` :
                  isInView ? `text-${color} opacity-85 grayscale-10` :
                    `text-${color} opacity-45 lg-touch:opacity-30 lg-desktop:opacity-30 grayscale`,
              )}
            />
            <div className="absolute -inset-1 hidden rounded-full ring-2 ring-brand-400/50 group-focus-visible:block" />
          </button>
        );
      })}
    </div>
  );
}



