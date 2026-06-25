"use client";

import React from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

const BTN_BASE = cn(
  "group relative flex h-11 w-11 items-center justify-center rounded-full",
  "bg-transparent",
  "text-brand-100 transition-all duration-200",
  "hover:bg-brand-100/10 hover:text-brand-50 active:scale-110",
  "disabled:pointer-events-none disabled:opacity-40",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
);

interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconStyle?: "caret" | "chevron";
}

export function CarouselPrevious({ className, iconStyle = "caret", ...props }: CarouselPreviousProps) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollPrev, canScrollPrev } = context;
  const Icon = iconStyle === "chevron" ? ArrowLeft : CaretLeftIcon;

  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Previous slide"
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <Icon weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconStyle?: "caret" | "chevron";
}

export function CarouselNext({ className, iconStyle = "caret", ...props }: CarouselNextProps) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollNext, canScrollNext } = context;
  const Icon = iconStyle === "chevron" ? ArrowRight : CaretRightIcon;

  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Next slide"
      className={cn(BTN_BASE, className)}
      {...props}
    >
      <Icon weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

export function CarouselIndicator({ className }: { className?: string }) {
  const context = useCarousel();
  if (!context) return null;

  const { activeIndex, dotsCount } = context;
  const current = Math.round(Number(activeIndex)) + 1;

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn("type-metadata tabular-nums select-none", className)}
    >
      {current} / {dotsCount}
    </span>
  );
}

interface CarouselDotsProps {
  className?: string;
  variant?: "default" | "dark";
}

export function CarouselDots({ className, variant = "default" }: CarouselDotsProps) {
  const context = useCarousel();
  if (!context) return null;

  const { dotsCount, activeIndex, goTo } = context;
  const aIndex = Math.round(Number(activeIndex));

  const dotColor =
    variant === "dark"
      ? { active: "bg-brand-800", inactive: "bg-secondary-600 hover:bg-secondary-700" }
      : { active: "bg-brand-700", inactive: "bg-brand-400 hover:bg-brand-500" };

  return (
    <div className={cn("flex justify-center items-center", className)} role="tablist">
      {Array.from({ length: dotsCount }).map((_, i) => {
        const isActive = i === aIndex;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="mx-1 flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            <span
              className={cn(
                "block h-2 w-2 rounded-sm transition-colors duration-300",
                isActive ? dotColor.active : dotColor.inactive
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
