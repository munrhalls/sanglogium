"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils/tailwind";
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

  useEffect(() => {
    if (slideRef.current) {
      console.log("[SRIP Trace] Slide Rendering with Capacity:", getComputedStyle(slideRef.current).getPropertyValue('--visible-count'));
      console.log("[SRIP Trace] Calculated Flex Basis:", slideRef.current?.style.flexBasis);
    }
  });

  return (
    <div
      ref={slideRef}
      data-active="false"
      className={cn("min-w-0 shrink-0 grow-0 snap-start", className)}
      style={{ flexBasis: "calc(100% / var(--visible-count, 1))" }}
    >
      {children}
    </div>
  );
}
