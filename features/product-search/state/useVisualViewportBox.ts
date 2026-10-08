"use client";

import { useEffect, useState } from "react";

interface ViewportBox {
  top: number;
  height: number;
  keyboardOpen: boolean;
}

/**
 * The visible part of the screen, i.e. what is NOT covered by the on-screen
 * keyboard. On iOS Safari and Android Chrome the layout viewport keeps its full
 * height when the keyboard opens, so a `fixed inset-0` surface extends behind
 * the keyboard and anything anchored to its bottom edge is unreachable. Sizing
 * the surface from the visual viewport keeps its whole height on-screen.
 *
 * Returns null until measured, when the API is missing, or while pinch-zoomed
 * (a zoomed visual viewport is not a keyboard); callers fall back to CSS `dvh`.
 */
export function useVisualViewportBox(): ViewportBox | null {
  const [box, setBox] = useState<ViewportBox | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      if (vv.scale > 1.01) {
        setBox(null);
        return;
      }
      setBox({
        top: Math.round(vv.offsetTop),
        height: Math.round(vv.height),
        keyboardOpen: window.innerHeight - vv.height > 120,
      });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return box;
}
