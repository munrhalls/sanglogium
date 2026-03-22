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

  useEffect(() => {
    console.log("[SRIP Trace] Provider Mount | Mode: Direct Reader | Sync ID:", Math.random().toString(36).substring(2, 11));
  }, []);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
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
    } else if (isLandscape) {
      count = breakpointMap?.mobileLandscape || 1;
    } else {
      count = breakpointMap?.mobilePortrait || 1;
    }

    setVisibleCount(count);
    console.log("[SRIP Trace] Context Source | Viewport Width:", w, "| Capacity Set To:", count);
  }, [breakpointMap]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 10);

    const firstChild = el.firstElementChild as HTMLElement;
    if (firstChild) {
      setActiveIndex(Math.round(scrollLeft / firstChild.offsetWidth));
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;

    updateVisibleCount();
    updateScrollState();

    const handleResize = () => {
      updateVisibleCount();
      updateScrollState();
    };

    window.addEventListener("resize", handleResize);
    el?.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      el?.removeEventListener("scroll", updateScrollState);
    };
  }, [updateVisibleCount, updateScrollState]);

  const scroll = useCallback((direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const slideWidth = (el.firstElementChild as HTMLElement).offsetWidth;
    const moveAmount = direction === 'next' ? slideWidth : -slideWidth;
    el.scrollBy({ left: moveAmount, behavior: "smooth" });
  }, []);

  const value = useMemo(() => ({
    scrollRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev: () => scroll('prev'),
    scrollNext: () => scroll('next'),
    activeIndex,
    itemsCount,
    visibleCount,
    goTo: (index: number) => {
      const el = scrollRef.current;
      const firstChild = el?.firstElementChild as HTMLElement;
      if (el && firstChild) {
        el.scrollTo({ left: index * firstChild.offsetWidth, behavior: "smooth" });
      }
    }
  }), [canScrollPrev, canScrollNext, activeIndex, itemsCount, scroll, visibleCount]);

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
