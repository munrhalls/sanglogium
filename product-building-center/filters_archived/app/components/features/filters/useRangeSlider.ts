"use client";

import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

interface UseRangeSliderOptions {
  /**
   * Called on drag-end (mouse/touch release, including releases outside the
   * input via the window-level pointer-up listener) and on keyboard commit
   * (release of Arrow/Home/End keys). Reads the latest values through a ref,
   * so it never goes stale.
   */
  onCommit: () => void;
}

/**
 * Shared drag/keyboard/commit lifecycle for the catalogue range sliders (G12),
 * extracted from PriceRangeSlider.tsx and StockMinimumSlider.tsx. Behavior is
 * identical to the original inline logic:
 * - one shared `isDragging` ref (the price range has two handles over one drag)
 * - a commit callback invoked on mouse/touch release and on keyboard key-up
 * - a window-level pointer-up listener so a drag released outside the input
 *   still commits (and double-fire is guarded by the isDragging flag)
 */
export function useRangeSlider({ onCommit }: UseRangeSliderOptions) {
  const isDragging = useRef(false);
  const isKeyboardRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const beginDrag = useCallback(() => {
    isDragging.current = true;
  }, []);

  const endDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    onCommitRef.current();
  }, []);

  // Release outside the slider window still commits (and still only once).
  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (isDragging.current) endDrag();
    };
    window.addEventListener("mouseup", handleWindowPointerUp);
    window.addEventListener("touchend", handleWindowPointerUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowPointerUp);
      window.removeEventListener("touchend", handleWindowPointerUp);
    };
  }, [endDrag]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
      isKeyboardRef.current = true;
    }
  }, []);

  const handleKeyUp = useCallback(() => {
    if (isKeyboardRef.current) {
      isKeyboardRef.current = false;
      onCommitRef.current();
    }
  }, []);

  const cancelDrag = useCallback(() => {
    isDragging.current = false;
    isKeyboardRef.current = false;
  }, []);

  return {
    isDragging,
    isKeyboardRef,
    beginDrag,
    endDrag,
    handleKeyDown,
    handleKeyUp,
    cancelDrag,
  };
}
