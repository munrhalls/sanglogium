"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { CarouselContextType, CarouselBreakpoints, CarouselProviderProps } from "./types";

const CarouselContext = createContext<CarouselContextType | null>(null);

export function CarouselProvider({
  children,
  itemsCount,
  breakpointMap
}: CarouselProviderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const updateVisibleCount = useCallback(() => {
    if (typeof window === "undefined") return;

    const w = window.innerWidth;
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    let count = 1;

    if (w >= 1280) {
      count = breakpointMap?.xl || 1;
    } else if (w >= 1024) {
      count = breakpointMap?.lgDesktop || 1;
    } else if (w >= 768) {
      count = isLandscape ? (breakpointMap?.mdLandscape || 1) : (breakpointMap?.mdPortrait || 1);
    } else if (w >= 640) {
      count = isLandscape ? (breakpointMap?.smLandscape || 1) : (breakpointMap?.smPortrait || 1);
    } else if (w >= 475) {
      count = isLandscape ? (breakpointMap?.xsLandscape || 1) : (breakpointMap?.xsPortrait || 1);
    } else if (isLandscape) {
      count = breakpointMap?.mobileLandscape || 1;
    } else {
      count = breakpointMap?.mobilePortrait || 1;
    }

    setVisibleCount(count);
  }, [breakpointMap]);

  const maxIndex = Math.max(0, itemsCount - visibleCount);
  const canScrollPrevDerived = activeIndex > 0;
  const canScrollNextDerived = activeIndex < maxIndex;

  useEffect(() => {
    updateVisibleCount();

    const handleResize = () => {
      updateVisibleCount();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateVisibleCount]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, itemsCount - visibleCount)));
  }, [visibleCount, itemsCount]);

  const scroll = useCallback((direction: 'prev' | 'next') => {
    setActiveIndex((current) => {
      const max = Math.max(0, itemsCount - visibleCount);
      if (direction === 'next') return Math.min(current + 1, max);
      if (direction === 'prev') return Math.max(0, current - 1);
      return current;
    });
  }, [itemsCount, visibleCount]);

  const goTo = useCallback((index: number) => {
    const max = Math.max(0, itemsCount - visibleCount);
    setActiveIndex(Math.min(Math.max(0, index), max));
  }, [itemsCount, visibleCount]);

  const value = useMemo(() => ({
    scrollRef,
    canScrollPrev: canScrollPrevDerived,
    canScrollNext: canScrollNextDerived,
    scrollPrev: () => scroll('prev'),
    scrollNext: () => scroll('next'),
    activeIndex,
    itemsCount,
    visibleCount,
    goTo,
  }), [canScrollPrevDerived, canScrollNextDerived, activeIndex, itemsCount, scroll, visibleCount, goTo]);

  return (
    <CarouselContext.Provider value={value}>
      <div
        className="h-full w-full"
        style={{ "--visible-count": visibleCount } as React.CSSProperties}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function useCarousel() { return useContext(CarouselContext); }
