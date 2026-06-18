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
      {/* Desktop (sm+): all three items in a static row */}
      <div className="max-sm:hidden flex items-center justify-center gap-4">
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature">Handcrafted</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature opacity-50" aria-hidden="true">·</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature">Precision Engineered</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature opacity-50" aria-hidden="true">·</span>
        <span className="type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature">Absolute Purity</span>
      </div>

      {/* Mobile (<sm): single item with fade cycle */}
      <div className="sm:hidden flex items-center justify-center">
        <span
          className={cn(
            "type-overline text-[11px] text-secondary-300 normal-case font-regular tracking-signature transition-opacity duration-300",
            fading ? "opacity-0" : "opacity-100"
          )}
        >
          {ITEMS[idx]}
        </span>
      </div>
    </div>
  );
}
