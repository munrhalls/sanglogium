"use client";

import React from "react";
import { CarouselContext } from "./CarouselContext";
import { useSnapCarousel } from "@/app/hooks/useSnapCarousel";
import { useContext } from "react";

export function Carousel({ children }: { children: React.ReactNode }) {
  const carouselLogic = useSnapCarousel();

  return (
    <CarouselContext.Provider value={carouselLogic}>
      <div className="relative w-full">{children}</div>
    </CarouselContext.Provider>
  );
}
export function CarouselTrack({ children }: { children: React.ReactNode }) {
  const context = useContext(CarouselContext);
  if (!context) return null;

  const { scrollRef } = context;

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className="no-scrollbar flex snap-x snap-mandatory flex-nowrap overflow-x-auto scroll-smooth"
    >
      {React.Children.map(children, (child) => (
        <div className="w-full flex-shrink-0 snap-start">{child}</div>
      ))}
    </div>
  );
}
