"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";

interface CarouselContextValue {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function Carousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 0);
    // 1px buffer vs sub-pixel rounding issues
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
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

  const scrollPrev = useCallback(() => {
    scrollRef.current?.scrollBy({
      left: -scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  }, []);

  const scrollNext = useCallback(() => {
    scrollRef.current?.scrollBy({
      left: scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  }, []);

  return (
    <CarouselContext.Provider
      value={{
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        scrollRef,
      }}
    >
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

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within Carousel");
  return context;
}
