"use client";

import React, { useContext } from "react";
import { CarouselContext } from "./CarouselContext";
import { CarouselPrevious, CarouselNext } from "./CarouselNavigation";
import { cn } from "@/lib/utils/tailwind";

export function CarouselPagination({ className }: { className?: string }) {
  const context = useContext(CarouselContext);
  if (!context) return null;

  // Destructure the new values
  const { activeIndex, snapCount, scrollTo } = context;

  // Guard: Don't show if 1 or 0 slides
  if (snapCount <= 1) return null;

  // Generate array for mapping
  const pages = Array.from({ length: snapCount }, (_, i) => i);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between px-4 py-4",
        className
      )}
    >
      {/* CRITICAL: We pass "static translate-y-0" to override the absolute positioning
        embedded in your BTN_BASE. 'tw-merge' (inside cn) handles the conflict cleanly.
      */}
      <CarouselPrevious className="static translate-y-0 border-white/20 bg-transparent text-white hover:bg-white/10" />

      <div className="flex items-center gap-3">
        {pages.map((pageIndex) => {
          const isActive = activeIndex === pageIndex;
          return (
            <button
              key={pageIndex}
              onClick={() => scrollTo(pageIndex)}
              aria-label={`Go to slide ${pageIndex + 1}`}
              className="group p-2 transition-all focus:outline-none"
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-300 ease-out",
                  isActive
                    ? "scale-125 bg-white"
                    : "bg-white/20 group-hover:bg-white/50"
                )}
              />
            </button>
          );
        })}
      </div>

      <CarouselNext className="static translate-y-0 border-white/20 bg-transparent text-white hover:bg-white/10" />
    </div>
  );
}
