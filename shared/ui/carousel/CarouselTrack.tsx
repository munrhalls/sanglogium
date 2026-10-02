"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

interface CarouselTrackProps {
  children: React.ReactNode;
  className?: string;
}

const SWIPE_THRESHOLD = 50;

export function CarouselTrack({
  children,
  className = "",
}: CarouselTrackProps) {
  const context = useCarousel();
  const touchStartRef = useRef<{ id: number; x: number } | null>(null);

  if (!context) return <div className={className}>{children}</div>;

  const { activeIndex, visibleCount, scrollRef } = context;

  // Calculate the exact percentage to move the belt
  const slidePercentage = 100 / visibleCount;
  const offset = activeIndex * slidePercentage;

  const hasNativePan =
    typeof className === "string" &&
    (className.includes("touch-pan-x") || className.includes("overflow-x-auto"));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      context.scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      context.scrollNext();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (hasNativePan) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { id: touch.identifier, x: touch.clientX };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (hasNativePan || !touchStartRef.current || !context) return;
    const start = touchStartRef.current;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === start.id) {
        const delta = touch.clientX - start.x;
        if (delta < -SWIPE_THRESHOLD) {
          context.scrollNext();
        } else if (delta > SWIPE_THRESHOLD) {
          context.scrollPrev();
        }
        break;
      }
    }
    touchStartRef.current = null;
  };

  return (
    // The Viewport: Hides the overflow
    <div
      ref={scrollRef}
      tabIndex={hasNativePan ? undefined : 0}
      role="group"
      aria-label="Carousel slides. Use left and right arrow keys to navigate."
      className={cn(
        className,
        "w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
      )}
      onKeyDown={hasNativePan ? undefined : handleKeyDown}
      onTouchStart={hasNativePan ? undefined : handleTouchStart}
      onTouchEnd={hasNativePan ? undefined : handleTouchEnd}
    >
      {/* The Belt: Animates smoothly when 'offset' changes */}
      <div
        className="flex h-full w-full items-stretch will-change-transform transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${offset}%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
