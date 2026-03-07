"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useSnapCarousel(itemsCount: number) {
  if (itemsCount === 0 || !itemsCount) {
    console.error("No items provided to the useSnapCarousel hook");
    return {
      scrollRef: null,
      canScrollPrev: false,
      canScrollNext: false,
      scrollPrev: () => {},
      scrollNext: () => {},
      activeIndex: 0,
      goTo: () => {},
    };
  }
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

    setCanScrollPrev(scrollLeft > 10); // 10px buffer for precision
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate which item is currently at the start of the lens
    const newIndex = Math.round(scrollLeft / itemWidth);
    setActiveIndex(newIndex);

    const currentVisible = Math.max(1, Math.round(clientWidth / itemWidth));
    setVisibleCount(currentVisible);
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

  return {
    scrollRef,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    activeIndex,
    visibleCount,
    goTo,
  };
}
