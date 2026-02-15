"use client";

import React, { createContext, useContext, useRef, useCallback } from "react";

interface CarouselContextValue {
  scroll: (direction: "left" | "right") => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function Carousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, clientWidth } = el;
    const offset = direction === "left" ? -clientWidth : clientWidth;

    el.scrollTo({
      left: scrollLeft + offset,
      behavior: "smooth",
    });
  }, []);

  return (
    <CarouselContext.Provider value={{ scroll, scrollRef }}>
      <div className="relative w-full">{children}</div>
    </CarouselContext.Provider>
  );
}

export function CarouselTrack({ children }: { children: React.ReactNode }) {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("CarouselTrack must be used within Carousel");

  return (
    <div
      ref={context.scrollRef as React.RefObject<HTMLDivElement>}
      className="no-scrollbar flex snap-x snap-mandatory flex-nowrap overflow-x-auto scroll-smooth"
    >
      {React.Children.map(children, (child) => (
        <div className="w-full flex-shrink-0 snap-start">{child}</div>
      ))}
    </div>
  );
}

export function useCarouselActions() {
  const context = useContext(CarouselContext);
  if (!context)
    throw new Error("useCarouselActions must be used within Carousel");
  return context;
}
