"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useSnapCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 0);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
    const newIndex = Math.round(scrollLeft / clientWidth);
    setActiveIndex(newIndex);
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

 const goTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTo({
      left: index * el.clientWidth,
      behavior: "smooth",
    });
  }, []);

  return {
    scrollRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    activeIndex,
    goTo,
  };
}
