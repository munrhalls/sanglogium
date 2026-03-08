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
}

const CarouselContext = createContext<CarouselContextType | null>(null);

export function CarouselProvider({ children, itemsCount }: { children: React.ReactNode; itemsCount: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

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
    goTo: (index: number) => {
      const el = scrollRef.current;
      const firstChild = el?.firstElementChild as HTMLElement;
      if (el && firstChild) {
        el.scrollTo({ left: index * firstChild.offsetWidth, behavior: "smooth" });
      }
    }
  }), [canScrollPrev, canScrollNext, activeIndex, itemsCount, scroll]);

  return <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>;
}

export function useCarousel() { return useContext(CarouselContext); }
