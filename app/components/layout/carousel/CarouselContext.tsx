"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from "react";

interface CarouselContextType {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  activeIndex: number;
  visibleCount: number;
  goTo: (index: number) => void;
  itemsCount: number;
}

const CarouselContext = createContext<CarouselContextType | null>(null);

export function CarouselProvider({ 
  children, 
  itemsCount 
}: { 
  children: React.ReactNode; 
  itemsCount: number 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0 || itemsCount === 0) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const itemWidth = scrollWidth / itemsCount;

    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 10);
    setActiveIndex(Math.round(scrollLeft / itemWidth));
    setVisibleCount(Math.max(1, Math.round(clientWidth / itemWidth)));
  }, [itemsCount]);

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

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = el.scrollWidth / itemsCount;
    el.scrollBy({ left: -itemWidth, behavior: "smooth" });
  }, [itemsCount]);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = el.scrollWidth / itemsCount;
    el.scrollBy({ left: itemWidth, behavior: "smooth" });
  }, [itemsCount]);

  const goTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = el.scrollWidth / itemsCount;
    el.scrollTo({ left: index * itemWidth, behavior: "smooth" });
  }, [itemsCount]);

  const value = useMemo(() => ({
    scrollRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    activeIndex,
    visibleCount,
    goTo,
    itemsCount
  }), [canScrollPrev, canScrollNext, activeIndex, visibleCount, itemsCount, scrollPrev, scrollNext, goTo]);

  return (
    <CarouselContext.Provider value={value}>
      {children}
    </CarouselContext.Provider>
  );
}

/**
 * Returns the Carousel context. 
 * Returns null if used outside of a CarouselProvider to allow for graceful component exits.
 */
export function useCarousel() {
  return useContext(CarouselContext);
}
