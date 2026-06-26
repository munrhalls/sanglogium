"use client";

import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

const BTN_BASE = cn(
  "group relative flex items-center justify-center rounded-full p-2",
  "bg-transparent",
  "text-brand-100 transition-all duration-200",
  "hover:bg-brand-100/10 hover:text-brand-50 active:scale-110",
  "disabled:pointer-events-none disabled:opacity-40",
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
);

const ARROW_VARIANT = {
  default: {
    text: "text-brand-100",
    hoverText: "hover:text-brand-50",
    ring: "focus-visible:ring-brand-400/50",
  },
  dark: {
    text: "text-brand-800",
    hoverText: "hover:text-brand-900",
    ring: "focus-visible:ring-brand-800/50",
  },
};

interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconStyle?: "caret" | "chevron";
  variant?: "default" | "dark";
}

export function CarouselPrevious({ className, iconStyle = "caret", variant = "default", ...props }: CarouselPreviousProps) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollPrev, canScrollPrev } = context;
  const v = ARROW_VARIANT[variant];

  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="Previous slide"
      className={cn(BTN_BASE, v.text, v.hoverText, v.ring, className)}
      {...props}
    >
      <CaretLeft size={24} weight="light" />
    </button>
  );
}

interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconStyle?: "caret" | "chevron";
  variant?: "default" | "dark";
}

export function CarouselNext({ className, iconStyle = "caret", variant = "default", ...props }: CarouselNextProps) {
  const context = useCarousel();
  if (!context) return null;

  const { scrollNext, canScrollNext } = context;
  const v = ARROW_VARIANT[variant];

  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="Next slide"
      className={cn(BTN_BASE, v.text, v.hoverText, v.ring, className)}
      {...props}
    >
      <CaretRight size={24} weight="light" />
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
  truncate?: boolean;
}

export function CarouselDots({ className, variant = "default", truncate = false }: CarouselDotsProps) {
  const context = useCarousel();
  if (!context) return null;

  const { dotsCount, activeIndex, goTo } = context;
  const aIndex = Math.round(Number(activeIndex));

  // ── Truncated (iOS) mode ──────────────────────────────────────────────────
  const WINDOW = 5;
  if (truncate && dotsCount > WINDOW) {
    const windowStart = Math.max(0, Math.min(aIndex - 2, dotsCount - WINDOW));
    const activePos = aIndex - windowStart; // 0..4

    const inactiveColor = variant === "dark" ? "bg-secondary-600" : "bg-brand-400";

    return (
      <div
        className={cn("flex justify-center items-center gap-1", className)}
        role="tablist"
      >
        {Array.from({ length: WINDOW }).map((_, pos) => {
          const realIndex = windowStart + pos;
          const dist = Math.abs(pos - activePos);
          const isActive = dist === 0;

          const sizeClass = dist === 0 ? "w-2 h-2" : dist === 1 ? "w-1.5 h-1.5" : "w-1 h-1";
          const opacityClass = dist === 0 ? "opacity-100" : dist === 1 ? "opacity-60" : "opacity-30";
          const colorClass = isActive ? "bg-accent-500" : inactiveColor;

          return (
            <button
              key={realIndex}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${realIndex + 1}`}
              onClick={() => goTo(realIndex)}
              className="flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
            >
              <span
                className={cn(
                  "block rounded-sm transition-all duration-300",
                  sizeClass,
                  opacityClass,
                  colorClass
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }
  // ── End truncated mode ────────────────────────────────────────────────────

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
            className="mx-0.5 flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
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
