"use client";

import React from "react";
import { cn } from "@/lib/utils/tailwind";
import { CarouselProvider } from "./CarouselContext";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemsCount: number;
}

export function Carousel({
  children,
  className = "",
  itemsCount = 0,
}: CarouselProps) {
  if (itemsCount === 0) return null;

  return (
    <CarouselProvider itemsCount={itemsCount}>
      <section
        className={cn("relative h-full w-full", className)}
        aria-roledescription="carousel"
      >
        {children}
      </section>
    </CarouselProvider>
  );
}
