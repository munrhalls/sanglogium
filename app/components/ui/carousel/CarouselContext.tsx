"use client";

import { createContext, useContext } from "react";

export interface CarouselContextValue {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarouselNavigation() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarouselNavigation must be used within a Carousel");
  }
  return context;
}
