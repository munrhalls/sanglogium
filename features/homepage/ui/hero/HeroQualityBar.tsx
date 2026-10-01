"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/tailwind";

const ITEMS = ["Handcrafted", "Precision Engineered", "Absolute Purity"] as const;
const CYCLE_MS = 3000;
const FADE_MS = 300;

export function HeroQualityBar() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined;

    const interval = setInterval(() => {
      setFading(true);
      fadeTimeout = setTimeout(() => {
        setIdx((i) => (i + 1) % ITEMS.length);
        setFading(false);
      }, FADE_MS);
    }, CYCLE_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-20",
        "pt-10 pb-3 sm:pb-4"
      )}
      style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))" }}
    >
      {/* Desktop (lg+): all three items in a static row */}
      <div className="hidden lg-desktop:flex lg-touch:flex flex items-center justify-center gap-4 overflow-hidden">
        <span className="type-overline text-[10px] text-secondary-100/80 normal-case font-regular tracking-[0.28em] whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">Handcrafted</span>
        <span className="type-overline text-[10px] text-secondary-100/80 normal-case font-regular tracking-[0.28em] opacity-50 whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]" aria-hidden="true">·</span>
        <span className="type-overline text-[10px] text-secondary-100/80 normal-case font-regular tracking-[0.28em] whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">Precision Engineered</span>
        <span className="type-overline text-[10px] text-secondary-100/80 normal-case font-regular tracking-[0.28em] opacity-50 whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]" aria-hidden="true">·</span>
        <span className="type-overline text-[10px] text-secondary-100/80 normal-case font-regular tracking-[0.28em] whitespace-nowrap [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">Absolute Purity</span>
      </div>

      {/* Mobile/tablet (<lg): single item with fade cycle */}
      <div className="lg:hidden flex items-center justify-center">
        <span
          className={cn(
            "type-overline text-[10px] text-secondary-100/80 normal-case font-regular tracking-[0.28em] transition-opacity duration-300 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]",
            fading ? "opacity-0" : "opacity-100"
          )}
        >
          {ITEMS[idx]}
        </span>
      </div>
    </div>
  );
}
