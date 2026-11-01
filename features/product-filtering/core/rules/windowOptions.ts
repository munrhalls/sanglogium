import type { OptionWindow, PanelOption } from '@/features/product-filtering/core/types/panel';

// How many options of one list show at once. Presentation only: it reads no URL and no count. Both numbers are chosen (Jan's example numbers).
// A list of COLLAPSE_ABOVE options or fewer shows all of them. A longer one, collapsed, shows its first SHOW_FIRST in place and keeps the ticked options
// beyond them apart, so a selection never hides; expanded, it shows all in place. Nothing is moved or re-sorted: ticking an option changes only its flag.
// The button is "more" when collapsed with an unticked option hidden, "less" when expanded, else none.

export const COLLAPSE_ABOVE = 15;
export const SHOW_FIRST = 7;

export function windowOptions(options: PanelOption[], expanded: boolean): OptionWindow {
  if (options.length <= COLLAPSE_ABOVE) return { head: [...options], pinned: [], toggle: null };
  if (expanded) return { head: [...options], pinned: [], toggle: 'less' };
  const rest = options.slice(SHOW_FIRST);
  return {
    head: options.slice(0, SHOW_FIRST),
    pinned: rest.filter((option) => option.ticked),
    toggle: rest.some((option) => !option.ticked) ? 'more' : null,
  };
}
