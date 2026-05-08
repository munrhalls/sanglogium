"use client";

import React from "react";
import { cn } from "@/lib/utils/tailwind";
import { useCarousel } from "./CarouselContext";

interface CarouselTrackProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselTrack({
  children,
  className = "",
}: CarouselTrackProps) {
  const context = useCarousel();
  if (!context) return <div className={className}>{children}</div>;

  const { activeIndex, visibleCount, scrollRef } = context;

  // Calculate the exact percentage to move the belt
  const slidePercentage = 100 / visibleCount;
  const offset = activeIndex * slidePercentage;

  return (
    // The Viewport: Hides the overflow
    <div className={cn(className, "w-full overflow-hidden")} ref={scrollRef}>
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
