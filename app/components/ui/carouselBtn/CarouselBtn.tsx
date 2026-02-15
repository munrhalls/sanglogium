"use client";

import { useCarouselActions } from "../carousel/Carousel";

interface Props {
  direction: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function CarouselBtn({ direction, children, className }: Props) {
  const { scroll } = useCarouselActions();
  return (
    <button onClick={() => scroll(direction)} className={className}>
      {children}
    </button>
  );
}
