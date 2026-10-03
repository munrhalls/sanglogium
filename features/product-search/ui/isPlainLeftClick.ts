import type { MouseEvent } from 'react';

/** True for a plain primary-button click (not cmd/ctrl/shift/alt-click, which should open a new tab/window). */
export function isPlainLeftClick(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
