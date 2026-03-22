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

  const { scrollRef } = context;

  return (
    <div
      ref={scrollRef}
      className={cn(
        "no-scrollbar flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth",
        className
      )}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {children}
    </div>
  );
}
