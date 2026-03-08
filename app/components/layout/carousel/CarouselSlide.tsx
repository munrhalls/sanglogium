"use client";

import React, { useRef, useEffect } from "react";
import { useCarousel } from "./CarouselContext";

interface CarouselSlideProps {
  children: React.ReactNode;
  className?: string;
}

export function CarouselSlide({ children, className = "" }: CarouselSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const context = useCarousel();

  useEffect(() => {
    const node = slideRef.current;
    const track = context?.scrollRef?.current;
    if (!node || !track) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.dataset.active = entry.isIntersecting ? "true" : "false";
      },
      {
        root: track,
        threshold: 0.6,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [context?.scrollRef]);

  return (
    <div ref={slideRef} data-active="false" className={className}>
      {children}
    </div>
  );
}
