"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from "react";

interface CarouselContextType {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  activeIndex: number;
  goTo: (index: number) => void;
  itemsCount: number;
  visibleCount: number;
}

const CarouselContext = createContext<CarouselContextType | null>(null);

export function CarouselProvider({
  children,
  itemsCount,
  breakpointMap
}: {
  children: React.ReactNode;
  itemsCount: number;
  breakpointMap?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  // Provider Level Trace: Map initialization
  useEffect(() => {
    console.log("[SRIP Trace] Using Map:", breakpointMap || "Default (All 1)");
  }, [breakpointMap]);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 10);

    const firstChild = el.firstElementChild as HTMLElement;
    if (firstChild) {
      setActiveIndex(Math.round(scrollLeft / firstChild.offsetWidth));
    }

    // The Reader: Iterate through signals to identify the active breakpoint
    if (signalRef.current) {
      const signals = signalRef.current.querySelectorAll<HTMLElement>('[data-signal="true"]');
      for (const span of Array.from(signals)) {
        if (window.getComputedStyle(span).display !== 'none') {
          const val = Number(span.getAttribute("data-value")) || 1;
          setVisibleCount(val);
          // Provider Level Trace: Active detection
          console.log("[SRIP Trace] Active Capacity Read:", val);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateState();
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState]);

  const scroll = useCallback((direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const moveAmount = direction === 'next' ? (el.firstElementChild as HTMLElement).offsetWidth : -(el.firstElementChild as HTMLElement).offsetWidth;
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
      {/* The Config Map: Dynamic signal spans based on breakpointMap or defaults to 1 */}
      <div ref={signalRef} className="hidden" aria-hidden="true">
        <span className="block sm:hidden" data-signal="true" data-value="1"></span>
        <span className="hidden sm:block md:hidden" data-signal="true" data-value={breakpointMap?.sm || 1}></span>
        <span className="hidden md:block lg:hidden" data-signal="true" data-value={breakpointMap?.md || 1}></span>
        <span className="hidden lg:block xl:hidden" data-signal="true" data-value={breakpointMap?.lg || 1}></span>
        <span className="hidden xl:block" data-signal="true" data-value={breakpointMap?.xl || 1}></span>
      </div>
      <div style={{ "--visible-count": visibleCount } as React.CSSProperties}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function useCarousel() { return useContext(CarouselContext); }

