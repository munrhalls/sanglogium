"use client";

import React from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";
import { CarouselIcon } from "./DotIcon";

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

  // Color tokens per variant
  const borderColor = variant === "dark" ? "border-brand-700" : "border-brand-400";
  const orbitColor  = variant === "dark" ? "text-brand-700"   : "text-brand-400";

  // ── Truncated (iOS) mode ──────────────────────────────────────────────────
  const WINDOW = 5;
  if (truncate && dotsCount > WINDOW) {
    const windowStart = Math.max(0, Math.min(aIndex - 2, dotsCount - WINDOW));
    const activePos = aIndex - windowStart; // 0..4

    return (
      <div
        className={cn("flex justify-center items-center gap-1.5", className)}
        role="tablist"
      >
        {Array.from({ length: WINDOW }).map((_, pos) => {
          const realIndex = windowStart + pos;
          const dist = Math.abs(pos - activePos);
          const isActive = dist === 0;

          // Size: active orbit 14px, adjacent 8px, edge 6px
          const sizeClass = dist === 0 ? "h-3.5 w-3.5" : dist === 1 ? "h-2 w-2" : "h-1.5 w-1.5";
          // Opacity: full / 60% / 30%
          const opacityClass = dist === 0 ? "opacity-100" : dist === 1 ? "opacity-60" : "opacity-30";

          return (
            <button
              key={realIndex}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${realIndex + 1}`}
              onClick={() => goTo(realIndex)}
              className="flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
            >
              {isActive ? (
                <CarouselIcon className={cn(sizeClass, opacityClass, orbitColor, "transition-all duration-300")} />
              ) : (
                <span
                  className={cn(
                    "block rounded-full border bg-transparent transition-all duration-300",
                    sizeClass,
                    opacityClass,
                    borderColor
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }
  // ── End truncated mode ────────────────────────────────────────────────────

  // ── Standard mode (dotsCount ≤ 5, or truncate=false) ─────────────────────
  return (
    <div className={cn("flex justify-center items-center gap-1.5", className)} role="tablist">
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
            className="flex h-4 w-4 cursor-pointer touch-manipulation items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
          >
            {isActive ? (
              <CarouselIcon className={cn("h-3.5 w-3.5 transition-all duration-300", orbitColor)} />
            ) : (
              <span
                className={cn(
                  "block h-2 w-2 rounded-full border bg-transparent transition-colors duration-300",
                  borderColor
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
