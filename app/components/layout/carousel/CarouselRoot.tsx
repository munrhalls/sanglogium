"use client";

import React from "react";
import { cn } from "@/lib/utils/tailwind";
import { CarouselProvider } from "./CarouselContext";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemsCount: number;
  breakpointMap?: {
    mobilePortrait?: number;
    mobileLandscape?: number;
    smPortrait?: number;
    smLandscape?: number;
    mdPortrait?: number;
    mdLandscape?: number;
    lgTouch?: number;
    lgDesktop?: number;
    xl?: number;
  };
}

export function Carousel({
  children,
  className = "",
  itemsCount = 0,
  breakpointMap,
}: CarouselProps) {
  if (itemsCount === 0) return null;

  return (
    <CarouselProvider itemsCount={itemsCount} breakpointMap={breakpointMap}>
      <section
        className={cn("relative h-full w-full", className)}
        aria-roledescription="carousel"
      >
        {children}
      </section>
    </CarouselProvider>
  );
}
