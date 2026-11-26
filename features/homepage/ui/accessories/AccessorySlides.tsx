"use client";

import React from "react";
import { useCarousel } from "@/platform/design/ui/carousel/CarouselContext";

export default function AccessorySlides({ children }: { children: React.ReactNode }) {
  const carousel = useCarousel();
  if (!carousel) return null;
  const slides = React.Children.toArray(children);
  const end = Math.min(slides.length, carousel.activeIndex + carousel.visibleCount + 1);
  return slides.slice(0, end);
}
