"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useCarouselNavigation } from "./CarouselContext";
import { cn } from "@/lib/utils/tailwind";

const BTN_BASE =
  "absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:h-12 md:w-12";

interface NavBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function CarouselPrevious({ className, ...props }: NavBtnProps) {
  const { scrollPrev, canScrollPrev } = useCarouselNavigation();

  return (
    <button
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={cn(BTN_BASE, "left-2 md:left-4", className)}
      aria-label="Previous slide"
      {...props}
    >
      <CaretLeftIcon size={32} weight="light" />
    </button>
  );
}

export function CarouselNext({ className, ...props }: NavBtnProps) {
  const { scrollNext, canScrollNext } = useCarouselNavigation();

  return (
    <button
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={cn(BTN_BASE, "right-2 md:right-4", className)}
      aria-label="Next slide"
      {...props}
    >
      <CaretRightIcon size={32} weight="light" />
    </button>
  );
}
